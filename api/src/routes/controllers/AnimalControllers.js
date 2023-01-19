const {Op, Animal, Usuario} = require("../../db")
const {generateId} = require("../utils/utils")

const getAllAnimal = async (req, res) => {
    const { name } = req.query;
    try {
        if(!name){
            const allAnimal = await Animal.findAll();
            return res.send(allAnimal);
        }else{
            let animal = await Animal.findAll({
                where:{
                    name:{
                        [Op.like]:'%'+name+'%'
                    }
                }
            });
            if(!animal[0]){
                return res.status(404).json({error: 'No existe ese nombre'})
            }
            return res.send(animal);
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
}

const getDetail = async(req,res) => {
    const { id } = req.params;
    try {
        if(id){
            const animalId = await Animal.findOne({
                where: {
                    id: id
                }
            });
            return res.send(animalId);
        }
    } catch (error) {
        res.status(400).send({error})
    }

}

const postAnimal = async (req, res) => {
    const { name, publication, species, age, weight, size, gender, race, description, image} = req.body;

    const createdAnimal = await Animal.create({
       id: generateId(),
       isAdopted: false,
       name,
       publication,
       species,
       age,
       weight,
       size,
       gender,
       race,
       description,
       image,
    });

    try {
        res.status(201).send(createdAnimal)
    } catch (error) {
        res.status(400).send({error: error.message})
    }
}

const deleteAnimal = async (req, res) => {
    try{
        const { id } = req.params
        await Animal.destroy({
            where: {
                id
            }
        })
        res.sendStatus(204)
    } catch(error){ 
        return res.status(500).json({message: error.message})
    }
}

const updateAnimal = async (req, res) => {
    try{
        const { id } = req.params;
        const { name, publication, species, age, weight, size, gender, race, description, image, isAdopted} = req.body;

        const animal = await Animal.findByPk(id)
        animal.name = name || animal.name;
        animal.publication = publication || animal.publication;
        animal.species = species || animal.species;
        animal.age = age || animal.age;
        animal.weight = weight || animal.weight;
        animal.size = size || animal.size;
        animal.gender = gender || animal.gender;
        animal.race = race || animal.race;
        animal.description = description || animal.description;
        animal.image = image || animal.image;
        animal.isAdopted = isAdopted || animal.isAdopted
        await animal.save()

        res.json(animal)

    } catch(error){
        return res.status(500).json({message: error.message})
    }
}

module.exports = {
    getAllAnimal,
    getDetail,
    postAnimal,
    deleteAnimal,
    updateAnimal
}