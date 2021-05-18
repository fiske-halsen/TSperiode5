import path from "path";
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
import { Db, Collection, ObjectID } from "mongodb";
import IPosition from "../interfaces/IPosition";
import FriendsFacade from "./friendFacade";
import { DbConnector } from "../config/dbconfig";
import { ApiError } from "../errors/apierror";

class PositionFacade {
  db: Db;
  positionCollection: Collection;
  friendFacade: FriendsFacade;

  constructor(db: Db) {
    this.db = db;
    this.positionCollection = db.collection("positions");
    this.friendFacade = new FriendsFacade(db);
  }

  async addOrUpdatePosition(
    email: string,
    longitude: number,
    latitude: number
  ): Promise<IPosition> {
    //find friend i Friend collection med find metode
    const foundFriend = await this.friendFacade.getFriendFromEmail(email);
    //lav name til position ud fra kombineret firstname og lastname fra friendcollection
    const pos: IPosition = {
      lastUpdated: new Date(),
      email: email,
      name: foundFriend.firstName + " " + foundFriend.lastName,
      location: { type: "Point", coordinates: [longitude, latitude] },
    };

    //
    const query = { email };
    const update = {
      $set: {
        ...pos,
      },
    }; //stort set hele IPosition skal gives her
    const options = { upsert: true, returnOriginal: false };
    const result = await this.positionCollection.findOneAndUpdate(
      query,
      update,
      options
    );
    return result.value;
  }

  async findNearbyFriends(
    email: string,
    password: string,
    longitude: number,
    latitude: number,
    distance: number
  ): Promise<Array<IPosition>> {
    // 1) Tjekke om han findes
    const foundFriend = await this.friendFacade.getFriendFromEmail(email);
    // this.friendFacade.getVerifiedUser
    // 2) Opdater hans position
    await this.addOrUpdatePosition(email, longitude, latitude);

    const result = await this.positionCollection
      .find({
        email: { $ne: email },
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: distance,
          },
        },
      })
      .toArray();
    console.log(result[0]);

    return result;
  }

  async getAllPositions(): Promise<Array<IPosition>> {
    return this.positionCollection.find({}).toArray();
  }
}

export default PositionFacade;

async function tester() {
  const client = await DbConnector.connect();
  const db = client.db(process.env.DB_NAME);
  const positionFacade = new PositionFacade(db);
  await positionFacade.addOrUpdatePosition("pp@b.dk", 5, 5);
  process.exit(0);
}

//tester()
