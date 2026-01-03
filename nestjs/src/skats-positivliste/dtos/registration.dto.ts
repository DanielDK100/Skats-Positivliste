import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegistrationDto {
  @IsNotEmpty({ message: 'ISIN kode er påkrævet' })
  @IsString({ message: 'ISIN kode skal være en streng' })
  @Length(12, 12, { message: 'ISIN kode skal være præcis 12 tegn lang' })
  @Matches(/^[A-Z]{2}[A-Z0-9]{10}$/, {
    message:
      'ISIN kode skal bestå af et 2-tegns landekode efterfulgt af 10 tegn (bogstaver og tal)',
  })
  isin: string;

  @IsNotEmpty({ message: 'Email er påkrævet' })
  @IsEmail({}, { message: 'Ugyldig email format' })
  email: string;
}

export class TopRegistrationDto {
  isin: string;
  amount: number;
}
