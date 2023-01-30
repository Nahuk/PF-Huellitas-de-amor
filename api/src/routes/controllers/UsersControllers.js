const { Op } = require('sequelize');
const { Usuario, Animal } = require('../../db');
const { generateId } = require("../utils/utils");
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
//const { transporter } = require('../utils/mailer');

const getAllUsers = async (req, res) => {
    const { name } = req.query;
    try {
        if (!name) {
            const allUsers = await Usuario.findAll();
            return res.send(allUsers);
        } else {
            let users = await Usuario.findAll({
                where: {
                    name: {
                        [Op.like]: '%' + name + '%'
                    }
                }
            });
            if (!users[0]) {
                return res.status(404).json({ error: 'El Usuario no existe' })
            }
            return res.send(users);
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
}

const postUser = async (req, res) => {
    const { name, surname, age, direction, email, hasAJob, occupation, password } = req.body;

    const emailExist = await Usuario.findOne({ where: { email } })

    if (emailExist) return res.status(409).send({ error: "El email ya está en uso" })

    const salt = await bcryptjs.genSalt(10);
    const encrypted = await bcryptjs.hash(password, salt);
    const newUser = await Usuario.create({
        id: generateId(),
        name,
        surname,
        age,
        direction,
        email,
        hasAJob,
        occupation,
        password: encrypted
    })

    const token = await jwt.sign({id: newUser._id}, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });

    try {
        res.cookie({"token": token}).status(200).send(newUser)
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        await Usuario.destroy({
            where: {
                id
            }
        })
        res.sendStatus(204)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, surname, age, direction, email, hasAJob, occupation} = req.body;

        const usuario = await Usuario.findByPk(id)
        usuario.name = name || usuario.name;
        usuario.surname = surname || usuario.surname;
        usuario.age = age || usuario.age;
        usuario.direction = direction || usuario.direction;
        usuario.email = email || usuario.email;
        usuario.hasAJob = hasAJob || usuario.hasAJob;
        usuario.occupation = occupation || usuario.occupation;
        usuario.password = usuario.password;
        await usuario.save();

        res.json(usuario)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getUserById = async (req, res) => {
    const { user_id } = req.params;

    try {
        const userData = await Usuario.findByPk(user_id);
        if(userData){
            res.status(200).json(userData);
        } else {
            return res.status(404).json({ message: error.message });
        }
    } catch (error) {
        return res.status(404).json({ message: error.message })
    }
}

//Usuario cambia contraseña
const updatePasswordUser = async (req, res) => {
    const { id } = req.params
    const { password } = req.body;

    let user = await Usuario.findByPk(id);
    const salt = await bcryptjs.genSalt(10);
    const newPassword = await bcryptjs.hash(password, salt);

    if (!user) return res.status(404).send('El Usuario no existe');
    try {
        user.password = newPassword;

        user.name = user.name;
        user.surname = user.surname;
        user.age = user.age;
        user.direction = user.direction;
        user.email = user.email;
        user.hasAJob = user.hasAJob;
        user.occupation = user.occupation
        await user.save()
        res.status(200).send({ message: "Cambiado exitosamente" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

const forgotPassword = async (req,res) => {
    const {email} = req.body;
    console.log(email);
    if(!email) return res.send("email es requerido");

    const user = await Usuario.findOne({
        where: {
            email: email
        }
    });
    console.log(user);

    if(!user) return res.send('Usuario no esta registardo');

    try {
        const token =  await jwt.sign({id: user._id}, process.env.RESET_PASSWORD_KEY, {
            expiresIn: '30m',
        });

        let transporter = await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILER_EMAIL,
                pass: process.env.MAILER_PASS,
            }
        })
        await transporter.sendMail({
            from: process.env.MAILER_EMAIL, // sender address
            to: user.email,
            subject: "Cambiar tu contraseña", // Subject line
            text: "Parece que has olvidado tu contraseña!", // plain text body
            html: `
            <h2>Por favor has click en el siguiente enlace para restablecer la contraseña</h2>
            <p>${process.env.CLIENT_URL}/users/resetpassword/${token}</p>
            `, // html body
          });
          user.setDataValue({reset: token});
          user.save();
          res.status(200).send("email enviado")
    } catch (error) {
          res.status(500).send({error: error.message});
    }
}

const resetpassword = async(req, res) => {
    const {reset} = req.params;
    const {newPassword} = req.body;
    console.log(reset);
    console.log(newPassword);
    if(!newPassword){
        return res.status(400).json("debe ingresar una nueva contraseña");
    }
    if(reset){
       await jwt.verify(reset, process.env.RESET_PASSWORD_KEY, function(err, decodedData){
            if(err){
                return res.json({
                    error: "Incorrect token or it is expired."
                })
            }
        });    
    }else{
        return res.status(401).json({error: "Error al autenticar"});
    }
    const user = await Usuario.findOne({reset}, function(err, user){
            
    });
    console.log(user)
    if(!user){
        return res.status(400).json({error: "User with this token does not existe"});
    }
   
    try {
        const salt = await bcryptjs.genSalt(10);
        const password = await bcryptjs.hash(newPassword, salt);
        user.update({
            password: password
        }
        );
        res.status(200).send("contraseña cambiada");

    } catch (error) {
        res.status(400).send({error:error.message});
    }
}

module.exports = {
    getAllUsers,
    postUser,
    deleteUser,
    updateUser,
    getUserById,
    updatePasswordUser,
    forgotPassword, 
    resetpassword
}