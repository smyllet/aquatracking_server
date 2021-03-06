import {DataTypes, Sequelize} from "sequelize";
import UserModel from "./UserModel";
import AquariumModel from "./AquariumModel";
import ApplicationModel from "./ApplicationModel";
import WeatherModel from "./WeatherModel";
import MeasurementModel from "./MeasurementModel";
import MeasurementSettingModel from "./MeasurementSettingModel";

export default class Db {
    private static sequelize = null;

    static async init(): Promise<void> {
        this.sequelize = new Sequelize(
            process.env.MARIADB_DATABASE,
            process.env.MARIADB_USER,
            process.env.MARIADB_PASSWORD,
            {
                dialect: 'mysql',
                host: process.env.MARIADB_HOST,
                port: Number(process.env.MARIADB_PORT),
            }
        );
        await Db.sequelize.authenticate();
        console.log('Connected to database');

        let sequelize = Db.sequelize;

        UserModel.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        }, {sequelize, tableName: 'users'});

        AquariumModel.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                defaultValue: '',
            },
            startedDate: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            },
            volume: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            salt: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            imageUrl: {
                type: DataTypes.STRING,
                defaultValue: '',
            },
            image: {
                type: DataTypes.BLOB('long'),
                allowNull: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: UserModel,
                    key: 'id'
                }
            }
        }, {sequelize, tableName: 'aquariums'});

        ApplicationModel.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                defaultValue: '',
            },
            token: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: UserModel,
                    key: 'id'
                }
            }
        }, {sequelize, tableName: 'applications'});

        WeatherModel.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            temperature: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            measuredAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            }
        }, {sequelize, tableName: 'weathers'});

        MeasurementModel.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            value: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            measuredAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            },
            aquariumId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: AquariumModel,
                    key: 'id'
                }
            }
        }, {sequelize, tableName: 'measurements'});

        MeasurementSettingModel.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            aquariumId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: AquariumModel,
                    key: 'id'
                }
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            visible: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            defaultMode: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 3
            },
            minValue: {
                type: DataTypes.DOUBLE,
                allowNull: true,
            },
            maxValue: {
                type: DataTypes.DOUBLE,
                allowNull: true,
            },
            mailAlert: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            notificationAlert: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        }, {sequelize, tableName: 'aquarium_measurement_settings'});

        await sequelize.sync();

        console.log('Database initialized');
    }
}
