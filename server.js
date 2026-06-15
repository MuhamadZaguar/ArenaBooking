const express = require('express');
const cors = require('cors');

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(cors());

// simple request logger for debugging
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.url);
    next();
});

// debug endpoint to list registered routes (for troubleshooting)
app.get('/__routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) { // routes registered directly on the app
            routes.push(middleware.route.path);
        } else if (middleware.name === 'router') { // router middleware
            middleware.handle.stack.forEach(function(handler){
                const route = handler.route;
                if(route){
                    routes.push((middleware.regexp && middleware.regexp.source) || 'router:' + (route.path || ''));
                }
            });
        }
    });
    res.json({ routes });
});

app.use('/auth', require('./routes/auth'));
app.use('/booking', require('./routes/booking'));
app.use('/admin', require('./routes/admin'));
app.use('/uploads', express.static('uploads'));
app.use('/lapangan', require('./routes/lapangan'));
app.use('/', require('./routes/view'));

// serve frontend
app.use(express.static('public'));

// dump registered routes to file (diagnostic)
const fs = require('fs');
function dumpRoutes(){
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({ path: middleware.route.path, methods: middleware.route.methods });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach(function(handler){
                const route = handler.route;
                if(route){
                    routes.push({ path: route.path, methods: route.methods });
                }
            });
        }
    });
    try{ fs.writeFileSync('routes_dump.json', JSON.stringify(routes, null, 2)); }catch(e){ console.log('Gagal menulis routes_dump.json', e); }
}

app.listen(3000, ()=>{
    console.log('Server berjalan di port 3000');
});