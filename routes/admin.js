const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

console.log('Admin route loaded');



// middleware: require auth and admin role
function isAdmin(req, res, next){
    if(!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if(req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    next();
}

router.put('/verifikasi/:id', auth, isAdmin, (req,res)=>{

    db.query(
        `UPDATE booking
        SET status='diterima'
        WHERE id=?`,
        [req.params.id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:'Booking disetujui'
            });

        }
    );
});

router.put('/tolak/:id', auth, isAdmin, (req,res)=>{

    db.query(
        `UPDATE booking
        SET status='ditolak'
        WHERE id=?`,
        [req.params.id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:'Booking ditolak'
            });

        }
    );
});

router.get('/booking-menunggu', auth, isAdmin, (req, res) => {

    db.query(
        `SELECT booking.*, users.nama
         FROM booking
         JOIN users ON booking.user_id = users.id
         WHERE status='menunggu_verifikasi'`,
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );

});

router.get('/booking', auth, isAdmin, (req, res) => {

    db.query(
        `SELECT
            booking.*,
            users.nama
        FROM booking
        JOIN users ON booking.user_id = users.id`,
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );

});

router.get('/laporan', auth, isAdmin, (req, res) => {

    db.query(
        `SELECT
            booking.id,
            users.nama,
            booking.tanggal,
            booking.jam_mulai,
            booking.jam_selesai,
            booking.status
        FROM booking
        JOIN users ON booking.user_id = users.id`,
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );

});

router.get('/dashboard', auth, isAdmin, (req, res) => {

    db.query(
        `SELECT
            COUNT(*) as total_booking
         FROM booking`,
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result[0]);
        }
    );

});

module.exports = router;