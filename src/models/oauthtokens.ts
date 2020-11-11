import { DataTypes, Model, BuildOptions } from 'sequelize';
import crypto from 'crypto';
import sequelize from '../db';

interface TokenInstance extends Model {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  clientId: number;
  TokenId: number;
}

type TokenStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): TokenInstance;
  associate: any;
};

const Token = <TokenStatic>sequelize.define('token', {
  accessToken: DataTypes.STRING,
  accessTokenExpiresAt: DataTypes.DATE,
  refreshToken: DataTypes.STRING,
  refreshTokenExpiresAt: DataTypes.DATE,
  clientId: DataTypes.INTEGER,
});

Token.associate = function associate() {};

export default Token;
