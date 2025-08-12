import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { GoogleOAuthPayload } from 'src/interfaces/GoogleAuthPayload';

export interface GoogleOAuth20Response {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}
@Injectable()
export class GoogleOAuth2Strategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ['email', 'profile'],
    });
  }
  validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      displayName: string;
      name: { givenName: string; familyName: string };
      emails: { value: string }[];
      photos: { value: string }[];
    },
  ): GoogleOAuthPayload {
    console.log('profile: ', profile);
    const { name, emails, photos } = profile;
    return {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };
  }
}
