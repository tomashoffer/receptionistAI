import { Injectable } from "@nestjs/common";
import { Strategy, Profile } from "passport-google-oauth20";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { UserService } from "../../user/user.service";
import { AuthService } from "../auth.service";
import { OauthDto } from "../dto/UserRegister.dto";
import { v4 as uuidv4 } from "uuid";
import { AuthProviders } from "../../../constants/auth.enums";
import { ApiConfigService } from "../../../shared/services/api-config.service";
import { AuthActions } from "../auth.types";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UserService,
    private readonly authService: AuthService,
    private readonly apiConfigService: ApiConfigService
  ) {
    super({
      clientID: apiConfigService.oauthConfig.GOOGLE.APP_KEY,
      clientSecret: apiConfigService.oauthConfig.GOOGLE.APP_SECRET,
      callbackURL: apiConfigService.oauthConfig.GOOGLE.CALLBACK_URL,
      scope: ["email", "profile"],
      profileFields: ["emails", "name"],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    token: string,
    tokenSecret: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void
  ): Promise<any> {
    let action: AuthActions;
    const email = profile.emails[0].value;
    let user = await this.usersService.findOne({
      email: email.toLocaleLowerCase(),
    });


    try {
      if (!user) {
        let userId = uuidv4(); 
        const guestId = req.cookies['guest_id'];

        if (guestId) {
          const existingGuest = await this.usersService.findById(guestId);
          if (!existingGuest) {
            userId = guestId;
          }
        }

        action = AuthActions.REGISTER;
        const userPayload: OauthDto = {
          id: userId,
          email,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          password:'',
          authProvider: AuthProviders.GOOGLE,
          business_name: undefined,
          business_phone: undefined,
          industry: undefined,
        };

        user = await this.usersService.createUser(userPayload);
      } else {
        action = AuthActions.LOGIN;
      }
      return user;
    } catch (ex) {
      console.log("Exception while google sign up");
      console.log(ex);
    }
  }
}