import { IContext } from '../../patterns/crud-pattern/interfaces/context.interface';
import { SPECIAL_CHAR } from '../constants/variables.constants';

export const nameof = <T>(name: keyof T) => name;

export function validateString(input: string): boolean {
  const minimumLength = 8;

  const stringWithoutSpaces = input.replace(/\s/g, '');
  const hasNumber = /[0-9]/.test(stringWithoutSpaces);
  const hasLowerCase = /[a-z]/.test(stringWithoutSpaces);
  const hasUpperCase = /[A-Z]/.test(stringWithoutSpaces);
  const hasSpecialChar = /[!@#$%*()_+\-=\{\}\[\]\\|;:\/\?]/.test(stringWithoutSpaces);

  /*
        These are the special characters that will be validated in the password (hasSpecialChar):
        ! @ # $ % * ( ) _ + - = { } [ ] \ | ; : / ?
    */

  if (!(stringWithoutSpaces.length > minimumLength) || !hasNumber || !hasLowerCase || !hasUpperCase || !hasSpecialChar) {
    return false;
  }

  return true;
}

export function generateRandomCode(context: IContext, numberCharacters: number): string {
  const upperCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const lowerCharacters = 'abcdefghijklmnopqrstuvwxyz';

  const specialCharacters = SPECIAL_CHAR;

  const numbers = '123456789';

  const allCharacters = upperCharacters + lowerCharacters + specialCharacters + numbers;

  let randomCode = '';

  const getRandomChar = (characters: string): string => {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  };

  randomCode += getRandomChar(upperCharacters);
  randomCode += getRandomChar(lowerCharacters);
  randomCode += getRandomChar(specialCharacters);
  randomCode += getRandomChar(numbers);

  for (let i = 3; i < numberCharacters; i++) {
    randomCode += getRandomChar(allCharacters);
  }

  return randomCode;
}

export function calculateDigitVerification(myNit) {
  let x, y;

  myNit = myNit.replace(/\s/g, '');
  myNit = myNit.replace(/,/g, '');
  myNit = myNit.replace(/\./g, '');
  myNit = myNit.replace(/-/g, '');

  if (isNaN(myNit)) {
    console.log(`NIT ${myNit} not valid`);
    return '';
  }

  const vpri = new Array(16);
  const z = myNit.length;

  vpri[1] = 3;
  vpri[2] = 7;
  vpri[3] = 13;
  vpri[4] = 17;
  vpri[5] = 19;
  vpri[6] = 23;
  vpri[7] = 29;
  vpri[8] = 37;
  vpri[9] = 41;
  vpri[10] = 43;
  vpri[11] = 47;
  vpri[12] = 53;
  vpri[13] = 59;
  vpri[14] = 67;
  vpri[15] = 71;

  x = 0;
  y = 0;
  for (let i = 0; i < z; i++) {
    y = myNit.substr(i, 1);
    x += y * vpri[z - i];
  }

  y = x % 11;

  return y > 1 ? 11 - y : y;
}

export function joinNames(firstName: string | null, middleName: string | null, lastName1: string | null, lastName2: string | null): string {
  const names = [firstName, middleName, lastName1, lastName2].filter((name) => name !== null);
  const fullName = names.join(' ').trim();
  return fullName;
}

export function generateConsecutive(lastConsecutive: string | null): string {
  const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const nextNumber = lastConsecutive ? String(Number(lastConsecutive.slice(-3)) + 1).padStart(3, '0') : '001';
  return `${currentDate}${nextNumber}`;
}

export function getKeysByValues<T extends Record<string, any>>(obj: T, values: any[]): (keyof T)[] {
  return Object.keys(obj).filter((key) => values.includes(obj[key])) as (keyof T)[];
}

export const formatPrice = (cop: number) => {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
  });
  return formatter.format(cop);
};
