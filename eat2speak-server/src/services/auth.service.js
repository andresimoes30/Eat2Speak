const bcrypt = require('bcrypt');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error('Invalid credentials');

  const token = generateToken({ id: user.userId, email: user.email });

  return {
    token,
    user: {
      id: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
  };
}

module.exports = { loginUser };
