import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, type VerifyCallback } from "passport-github2"
import type { ConfigService } from "@nestjs/config"
import type { AuthService } from "../auth.service"

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>("GITHUB_CLIENT_ID"),
      clientSecret: configService.get<string>("GITHUB_CLIENT_SECRET"),
      callbackURL: configService.get<string>("GITHUB_CALLBACK_URL"),
      scope: ["user:email"],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { id, username, displayName, emails, photos } = profile

    // GitHub might not always provide email in profile, so we get the primary one
    const primaryEmail = emails?.find((email: any) => email.primary)?.value || emails?.[0]?.value

    const user = {
      githubId: id.toString(),
      username,
      email: primaryEmail,
      displayName: displayName || username,
      avatar: photos?.[0]?.value,
      accessToken,
      refreshToken,
    }

    const validatedUser = await this.authService.validateGitHubUser(user)
    done(null, validatedUser)
  }
}
