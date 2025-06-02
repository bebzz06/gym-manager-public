import { AgeCategory } from '../constants/user.js';

export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const determineAgeCategory = (age: number): string => {
  if (age <= 15) return AgeCategory.KID;
  if (age <= 17) return AgeCategory.JUVENILE;
  return AgeCategory.ADULT;
};
