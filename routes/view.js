const express = require('express');

const router = express.Router();

router.get('/', (req,res)=>{
    res.render('login');
});

router.get('/register',(req,res)=>{
    res.render('register');
});

router.get('/dashboard-user',(req,res)=>{
    res.render('dashboard-user');
});

router.get('/booking-page',(req,res)=>{
    res.render('booking');
});

router.get('/dashboard-admin',(req,res)=>{
    res.render('dashboard-admin');
});

router.get('/lapangan/edit/:id', (req, res) => {
    // render edit form; client-side will fetch lapangan data
    res.render('edit-lapangan');
});

router.get('/riwayat',(req,res)=>{
    res.render('riwayat');
});

module.exports = router;