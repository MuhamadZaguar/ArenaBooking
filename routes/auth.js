const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

router.post('/register', async(req,res)=>{

    const {nama,email,password} = req.body;

    const hash = await bcrypt.hash(password,10);

    // set default role to 'user'
    db.query(
        'INSERT INTO users(nama,email,password,role) VALUES (?,?,?,?)',
        [nama,email,hash,'user'],
        (err,result)=>{
            if(err) return res.status(500).json(err);

            res.json({
                message:'Registrasi berhasil'
            });
        }
    );
});

router.post('/login',(req,res)=>{

    const {email,password} = req.body;

    db.query(
        'SELECT * FROM users WHERE email=?',
        [email],
        async(err,result)=>{
            if (err) {
                return res.status(500).json(err);
            }

            if (!result || result.length === 0) {
                return res.status(404).json({
                    message: 'User tidak ditemukan'
                });
            }

            const user = result[0];

            // Support existing plain-text passwords for compatibility.
            // If stored password looks like a bcrypt hash (starts with $2), use bcrypt.compare.
            // Otherwise compare as plain text. If plain-text match, re-hash and update DB.
            let match = false;
            const stored = user.password || '';
            const looksHashed = stored.startsWith('$2');
            if (looksHashed) {
                match = await bcrypt.compare(password, stored);
            } else {
                // plain text stored password
                match = password === stored;
            }

            if (!match) {
                return res.status(401).json({
                    message: 'Password salah'
                });
            }

            // If the password was stored as plain text, upgrade it to a bcrypt hash now
            if (!looksHashed) {
                try {
                    const newHash = await bcrypt.hash(password, 10);
                    db.query('UPDATE users SET password=? WHERE id=?', [newHash, user.id], (uerr) => {
                        if (uerr) console.warn('Gagal update hash password untuk user', user.id, uerr);
                    });
                } catch (e) {
                    console.warn('Gagal meng-hash password saat upgrade:', e);
                }
            }

            const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey');

            res.json({ token, role: user.role });

        }
    );
});

module.exports = router;