const { db, run } = require('../config/db');

async function createUser(req, res) {
  try {
    const {
      name,
      email,
      password,
      role = 'buyer',
      phone,
      studyyear,
      branch,
      section,
      residency,
      payment_received = 0,
      amount_given = 0
    } = req.body;

    const [result] = await run(
      `INSERT INTO users 
       (user_name, user_email, user_password, role, user_phone, user_studyyear, user_branch, user_section, user_residency, payment_received, amount_given) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        password,
        role,
        phone,
        studyyear,
        branch,
        section,
        residency,
        payment_received,
        amount_given
      ]
    );

    res.json({
      message: '✅ User added successfully',
      userId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createUser };
