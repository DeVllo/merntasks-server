const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.autenticarUsuario = async (req, res) =>{

    //revisar si hay errores
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errores: errors.array()})
    }

    // extraer el email y el password
    const { email, password } = req.body;

    try{
        //Revisar que sea un usuario registrado
        let usuario = await Usuario.findOne({email});
        if(!usuario){
            return res.status(400).json({msg: 'El usuario no existe'});
        }

        //Revisar el password
        const passwordCorrecto = await bcryptjs.compare(password, usuario.password);
        if(!passwordCorrecto){
            return res.status(400).json({msg: 'Password incorrecto'});
        }
        //Si todo es correcto entonces
        // Crear y firmar el JWT
        const payload = {
            usuario: {
                id: usuario.id
            }
        }

        //firmar el JWT
        jwt.sign(payload, process.env.secretword, {
            expiresIn: 3600
        }, (error, token)=> {
            if(error) throw error;

            //Mensaje de confirmacion
            res.json({ token })

        });

    }catch (error) {
        console.log(error)
    }
}

// Obtiene que usuario está autenticado
exports.usuarioAutenticado = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        res.json({usuario});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: 'Hubo un error'});
    }
}