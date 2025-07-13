// server/controllers/authController.js
const User = require("../models/User");
const Shop = require("../models/Shop");
const Token = require("../models/Token");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const emailService = require("../services/emailService");
const smsService = require("../services/smsService");

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      userType,
      shopName,
      shopAddress,
      shopCategory,
      openingTime,
      closingTime,
      latitude,
      longitude
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already in use" });
      }
      return res.status(400).json({ message: "Phone number already in use" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password, // Hashed in the model's pre-save hook
      userType: userType || "customer",
    });

    // Save user
    await user.save();

    // If user is a vendor, create shop
    if (userType === "vendor" && shopName) {
      const shop = new Shop({
        name: shopName,
        owner: user._id,
        category: shopCategory,
        description: `${shopName} - ${shopCategory}`,
        address: {
          street: shopAddress,
          city: "",
          state: "",
          zipCode: "",
          country: "",
          coordinates: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
        },
        contactInfo: {
          phone: phone,
          email: email,
        },
        operatingHours: [
          {
            day: "Monday",
            open: openingTime,
            close: closingTime,
            isClosed: false,
          },
          {
            day: "Tuesday",
            open: openingTime,
            close: closingTime,
            isClosed: false,
          },
          {
            day: "Wednesday",
            open: openingTime,
            close: closingTime,
            isClosed: false,
          },
          {
            day: "Thursday",
            open: openingTime,
            close: closingTime,
            isClosed: false,
          },
          {
            day: "Friday",
            open: openingTime,
            close: closingTime,
            isClosed: false,
          },
          {
            day: "Saturday",
            open: openingTime,
            close: closingTime,
            isClosed: false,
          },
          {
            day: "Sunday",
            open: openingTime,
            close: closingTime,
            isClosed: true,
          },
        ],
        isVerified: false,
        isActive: false,
      });

      await shop.save();

      // Add shop reference to user
      user.shop = shop._id;
      await user.save();
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res
        .status(401)
        .json({
          message: "Your account has been deactivated. Please contact support.",
        });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update last login timestamp
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * Send OTP for verification
 * @route POST /api/auth/send-otp
 */
exports.sendOTP = async (req, res) => {
  try {
    const { email, phone, purpose } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: email || "" }, { phone: phone || "" }],
    });

    // For registration, user shouldn't exist
    if (purpose === "registration" && user) {
      return res.status(400).json({
        message: "User with this email or phone already exists",
      });
    }

    // For other purposes like login/reset, user should exist
    if ((purpose === "login" || purpose === "reset") && !user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store OTP in database
    let otpRecord = await Token.findOne({
      user: user ? user._id : null,
      email,
      phone,
      type: "otp",
    });

    if (otpRecord) {
      // Update existing OTP
      otpRecord.token = otp;
      otpRecord.expiresAt = expiresAt;
    } else {
      // Create new OTP record
      otpRecord = new Token({
        user: user ? user._id : null,
        email,
        phone,
        token: otp,
        type: "otp",
        expiresAt,
      });
    }

    await otpRecord.save();

    // Send OTP via email
    if (email) {
      await emailService.sendOtpEmail(email, otp);
    }

    // Send OTP via SMS
    if (phone) {
      await smsService.sendOTP(phone, otp);
    }

    res.status(200).json({
      message: "OTP sent successfully",
      expiresAt,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Server error while sending OTP" });
  }
};

/**
 * Verify OTP
 * @route POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp, purpose } = req.body;

    if ((!email && !phone) || !otp) {
      return res.status(400).json({
        message: "Email/phone and OTP are required",
      });
    }

    // Find the OTP record
    const otpRecord = await Token.findOne({
      $or: [{ email: email || "" }, { phone: phone || "" }],
      token: otp,
      type: "otp",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // OTP is valid, update verification status based on purpose
    if (purpose === "registration" && otpRecord.user) {
      // Verify user
      const user = await User.findById(otpRecord.user);
      if (user) {
        user.isVerified = true;
        await user.save();
      }
    }

    // Delete the used OTP
    await Token.findByIdAndDelete(otpRecord._id);

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error while verifying OTP" });
  }
};

/**
 * Forgot password - sends reset link
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      // For security reasons, still return success even if user not found
      return res.status(200).json({
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token to database
    let tokenRecord = await Token.findOne({
      user: user._id,
      type: "reset",
    });

    if (tokenRecord) {
      // Update existing token
      tokenRecord.token = hashedToken;
      tokenRecord.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    } else {
      // Create new token record
      tokenRecord = new Token({
        user: user._id,
        email: user.email,
        token: hashedToken,
        type: "reset",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });
    }

    await tokenRecord.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    // Send email with reset link
    await emailService.sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      message:
        "If your email is registered, you will receive a password reset link",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res
      .status(500)
      .json({ message: "Server error while processing password reset" });
  }
};

/**
 * Reset password using token
 * @route POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    // Hash the token from URL for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid token in database
    const tokenRecord = await Token.findOne({
      token: hashedToken,
      type: "reset",
      expiresAt: { $gt: new Date() },
    });

    if (!tokenRecord) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find user
    const user = await User.findById(tokenRecord.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password
    user.password = password; // Password hashing handled in User model pre-save hook
    await user.save();

    // Delete used token
    await Token.findByIdAndDelete(tokenRecord._id);

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(user.email);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: "Server error while resetting password" });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @middleware auth
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      profilePicture: user.profilePicture || "",
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    // If user is a vendor, include shop details
    if (user.userType === "vendor" && user.shop) {
      const shop = await Shop.findById(user.shop);
      if (shop) {
        userData.shop = {
          id: shop._id,
          name: shop.name,
          category: shop.category,
          isVerified: shop.isVerified,
          isActive: shop.isActive,
        };
      }
    }

    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/update-profile
 * @middleware auth
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) {
      // Check if phone is already in use by another user
      const existingUser = await User.findOne({
        phone,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
      user.phone = phone;
    }
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};
