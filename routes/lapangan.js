const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

console.log('Lapangan route loaded');

const router = express.Router();

router.get('/', (req, res) => {

    db.query(
        'SELECT * FROM lapangan',
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );

});

// get single lapangan by id
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query(
        'SELECT * FROM lapangan WHERE id = ?',
        [id],
        (err, result) => {
            if(err) return res.status(500).json({ message: err.message || 'DB error' });
            if(!Array.isArray(result) || result.length === 0) return res.status(404).json({ message: 'Lapangan tidak ditemukan' });
            res.json(result[0]);
        }
    );

});


router.post('/', auth, (req, res) => {

    // hanya admin yang boleh menambahkan lapangan
    if(!req.user || req.user.role !== 'admin'){
        return res.status(403).json({ message: 'Forbidden' });
    }
    const {
        nama_lapangan,
        jenis_olahraga,
        harga_per_jam,
        deskripsi,
        lokasi
    } = req.body;

    // basic validation
    if(!nama_lapangan || nama_lapangan.trim() === ''){
        return res.status(400).json({ message: 'Nama lapangan wajib diisi' });
    }
    const harga = Number(harga_per_jam);
    if(Number.isNaN(harga) || harga <= 0){
        return res.status(400).json({ message: 'Harga per jam harus angka lebih besar dari 0' });
    }

    // tolerant insert: cek keberadaan kolom 'jenis_olahraga' dan 'lokasi'
    db.query("SHOW COLUMNS FROM lapangan LIKE 'jenis_olahraga'", (cErr, cRes) => {
        if(cErr){
            console.warn('Gagal cek kolom lapangan (jenis_olahraga):', cErr);
            return res.status(500).json({ message: cErr.message || 'DB error' });
        }
        const hasJenis = Array.isArray(cRes) && cRes.length > 0;
        db.query("SHOW COLUMNS FROM lapangan LIKE 'lokasi'", (lErr, lRes) => {
            if(lErr){
                console.warn('Gagal cek kolom lapangan (lokasi):', lErr);
                return res.status(500).json({ message: lErr.message || 'DB error' });
            }
            const hasLokasi = Array.isArray(lRes) && lRes.length > 0;

            // build dynamic columns and params
            const cols = ['nama_lapangan'];
            const params = [nama_lapangan];
            if(hasJenis) { cols.push('jenis_olahraga'); params.push(jenis_olahraga || ''); }
            if(hasLokasi) { cols.push('lokasi'); params.push(lokasi || ''); }
            cols.push('harga_per_jam'); params.push(harga);
            cols.push('deskripsi'); params.push(deskripsi || '');

            const placeholders = cols.map(()=>'?').join(',');
            const sql = `INSERT INTO lapangan (${cols.join(',')}) VALUES (${placeholders})`;
            db.query(sql, params, (err, result) => {
                if(err) return res.status(500).json({ message: err.message || 'SQL error' });
                res.json({ message: 'Lapangan berhasil ditambahkan', id: result.insertId });
            });
        });
    });

});

router.put('/:id', auth, (req, res) => {

    // hanya admin yang boleh mengupdate lapangan
    if(!req.user || req.user.role !== 'admin'){
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;
    const { nama_lapangan, jenis_olahraga, harga_per_jam, deskripsi, lokasi } = req.body;

    // check if jenis_olahraga and lokasi columns exist; update accordingly
    db.query("SHOW COLUMNS FROM lapangan LIKE 'jenis_olahraga'", (cErr, cRes) => {
        if(cErr) return res.status(500).json({ message: cErr.message || 'DB error' });
        const hasJenis = Array.isArray(cRes) && cRes.length > 0;
        db.query("SHOW COLUMNS FROM lapangan LIKE 'lokasi'", (lErr, lRes) => {
            if(lErr) return res.status(500).json({ message: lErr.message || 'DB error' });
            const hasLokasi = Array.isArray(lRes) && lRes.length > 0;

            const sets = ['nama_lapangan=?'];
            const params = [nama_lapangan];
            if(hasJenis){ sets.push('jenis_olahraga=?'); params.push(jenis_olahraga || ''); }
            if(hasLokasi){ sets.push('lokasi=?'); params.push(lokasi || ''); }
            sets.push('harga_per_jam=?'); params.push(harga_per_jam);
            sets.push('deskripsi=?'); params.push(deskripsi || '');

            const sql = `UPDATE lapangan SET ${sets.join(', ')} WHERE id=?`;
            params.push(id);
            db.query(sql, params, (err, result) => {
                if(err) return res.status(500).json({ message: err.message || 'SQL error' });
                res.json({ message: 'Lapangan berhasil diupdate' });
            });
        });
    });

});

router.delete('/:id', auth, (req, res) => {

    // hanya admin yang boleh menghapus lapangan
    if(!req.user || req.user.role !== 'admin'){
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;

    db.query(
        'DELETE FROM lapangan WHERE id=?',
        [id],
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message: 'Lapangan berhasil dihapus'
            });
        }
    );

});

module.exports = router;