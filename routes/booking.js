const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post('/', auth, (req,res)=>{

    const {
        lapangan_id,
        tanggal,
        jam_mulai,
        jam_selesai
    } = req.body;

    db.query(
        `INSERT INTO booking
        (user_id,lapangan_id,tanggal,jam_mulai,jam_selesai)
        VALUES (?,?,?,?,?)`,
        [
            req.user.id,
            lapangan_id,
            tanggal,
            jam_mulai,
            jam_selesai
        ],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            // return insertId so frontend can upload bukti to /booking/upload/:id
            res.json({
                message:'Booking berhasil',
                id: result.insertId
            });

        }
    );
});

router.post(
    '/upload/:id',
    auth,
    upload.single('bukti'),
    (req, res) => {

        console.log('REQ FILE =', req.file);
        console.log('REQ BODY =', req.body);

        if (!req.file) {
            return res.status(400).json({
                message: 'File tidak ditemukan'
            });
        }

        const bookingId = req.params.id;
        const namaFile = req.file.filename;

        db.query(
            `UPDATE booking
             SET bukti_pembayaran=?,
                 status='menunggu_verifikasi'
             WHERE id=?`,
            [namaFile, bookingId],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message: 'Bukti pembayaran berhasil diupload',
                    file: namaFile
                });
            }
        );
    }
);

router.get('/riwayat', auth, (req, res) => {

    db.query(
        `SELECT
            booking.*,
            lapangan.nama_lapangan
         FROM booking
         JOIN lapangan
         ON booking.lapangan_id = lapangan.id
         WHERE booking.user_id=?`,
        [req.user.id],
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );

});

module.exports = router;