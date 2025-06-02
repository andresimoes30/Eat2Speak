const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

const { User, UserLanguage, Restaurant, Role, UserRole } = db;

const registerUser = async (req, res) => {
  const {
    userTypes, // Ex: ['student', 'native'] ou ['restaurant']
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    address,
    nationality,
    gender,
    languageName,
    restaurantName,
    cuisineType
  } = req.body;

  if (!Array.isArray(userTypes) || userTypes.length === 0 || !firstName || !lastName || !email || !password || !phoneNumber) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      phoneNumber,
      address: userTypes.includes('restaurant') ? null : address,
      nationality,
      gender
    });

    // Atribuir papéis
    for (const type of userTypes) {
      const role = await Role.findOne({ where: { description: type } });
      if (role) {
        await UserRole.create({
          userId: newUser.userId,
          roleId: role.roleId
        });
      }
    }

    // Nativo: idioma
    if (userTypes.includes('native')) {
      if (!languageName) {
        return res.status(400).json({ message: 'languageName is required for native user' });
      }

      await UserLanguage.create({
        userId: newUser.userId,
        languageName,
        proficiencyLevel: 'Nativo'
      });
    }

    // Restaurante: dados extras
    if (userTypes.includes('restaurant')) {
      if (!restaurantName || !cuisineType || !address) {
        return res.status(400).json({ message: 'restaurantName, cuisineType and address are required for restaurant user' });
      }

      await Restaurant.create({
        ownerUserId: newUser.userId,
        name: restaurantName,
        cuisineType,
        address,
        seatsPerTable: 4,
        availableTables: 5,
        commissionPercent: 10.0
      });
    }

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Role,
          through: { attributes: [] } // remove info da tabela intermediária
        },
        {
          model: UserLanguage
        },
        {
          model: Restaurant
        }
      ]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ message: 'Email already in use' });
    }

    // Atualiza os campos
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    const safeUser = user.toJSON();
    delete safeUser.passwordHash;

    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  getProfile,
  updateProfile
};
