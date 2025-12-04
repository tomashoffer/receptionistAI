// src/data-source.ts
import "dotenv/config";
import { DataSource } from "typeorm";
import * as path from "path";
import { SnakeNamingStrategy } from "./snake-naming.strategy";
import { UserEntity } from "./modules/user/user.entity";
import { AppointmentEntity } from "./modules/appointments/appointment.entity";
import { VoiceInteractionEntity } from "./modules/voice/voice-interaction.entity";
import { Business } from "./modules/business/entities/business.entity";
import { BusinessUser } from "./modules/business/entities/business-user.entity";
import { CallLog } from "./modules/business/entities/call-log.entity";
import { BusinessPlan } from "./modules/business/entities/business-plan.entity";
import { Assistant } from "./modules/assistant/entities/assistant.entity";
import { Contact } from "./modules/contact/entities/contact.entity";
import { Tag } from "./modules/contact/entities/tag.entity";
import { ContactTag } from "./modules/contact/entities/contact-tag.entity";

const isCompiled = path.extname(__filename).endsWith(".js");

const options = {
  type: "postgres",
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  username: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DB!,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    UserEntity,
    AppointmentEntity,
    VoiceInteractionEntity,
    Business,
    BusinessUser,
    CallLog,
    BusinessPlan,
    Assistant,
    Contact,
    Tag,
    ContactTag,
  ],
  migrations: [
    isCompiled
      ? path.join(__dirname, "database/migrations/*.js")
      : path.join(__dirname, "database/migrations/*.ts"),
  ],
  synchronize: false,
  logging: false,
};

// **Sólo un export default** de la instancia
const AppDataSource = new DataSource(options as any);
export default AppDataSource;
