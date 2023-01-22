const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('animal', {
    id:{
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publication: {
      type: DataTypes.DATE,
      allowNull: false,
      validate:{
        isDate: true
      }
    },
    species: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      get(){
        const age = this.getDataValue('age');
        const ageTime = this.getDataValue('ageTime');

        return age ? `${age} ${ageTime} old` : null
      }
    },
    ageTime:{
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["months", "years"]]
      }
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      get(){
        const weight = this.getDataValue('weight');
        return weight ? `${weight} kg` : null;
      }
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    race: {
      type: DataTypes.STRING,
      defaultValue: "mestizo"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false, 
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    isAdopted: {
      type: DataTypes.BOOLEAN,
    }
  });
};
