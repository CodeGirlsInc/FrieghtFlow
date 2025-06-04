import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, type VerifyCallback } from "passport-google-oauth20"
import type { ConfigService } from "@nestjs/config"
import type { AuthService } from "../auth.service"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.get<string>("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { id, name, emails, photos } = profile

    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    }

    const validatedUser = await this.authService.validateGoogleUser(user)
    done(null, validatedUser)
  }
}
