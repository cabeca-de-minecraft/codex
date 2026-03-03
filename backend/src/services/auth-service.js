import bcrypt from "bcryptjs";
import { AppError } from "../config/errors.js";
import { prisma } from "../prisma/client.js";

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 72;
const PASSWORD_SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;
const EMAIL_LOCAL_PART_MIN_LENGTH = 3;
const SALT_ROUNDS = 10;

function splitEmailParts(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const [localPart, domain, extra] = normalizedEmail.split("@");

  if (!localPart || !domain || extra) {
    throw new AppError("E-mail inválido.", 400, "INVALID_EMAIL");
  }

  return {
    normalizedEmail,
    localPart,
    domain
  };
}

function validateEmailFormat(email) {
  const { normalizedEmail, localPart, domain } = splitEmailParts(email);

  if (localPart.length < EMAIL_LOCAL_PART_MIN_LENGTH) {
    throw new AppError(
      "O e-mail precisa ter pelo menos 3 caracteres antes do @.",
      400,
      "INVALID_EMAIL"
    );
  }

  if (!domain.includes(".")) {
    throw new AppError("Domínio de e-mail inválido.", 400, "INVALID_EMAIL");
  }

  return normalizedEmail;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt
  };
}

export function validatePasswordRules(password) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AppError("A senha deve ter pelo menos 6 caracteres.", 400, "INVALID_PASSWORD");
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new AppError("A senha deve ter no máximo 72 caracteres.", 400, "INVALID_PASSWORD");
  }

  if (!PASSWORD_SPECIAL_CHAR_REGEX.test(password)) {
    throw new AppError(
      "A senha deve conter pelo menos 1 caractere especial.",
      400,
      "INVALID_PASSWORD"
    );
  }
}

export async function registerUser({ email, password }) {
  const normalizedEmail = validateEmailFormat(email);
  validatePasswordRules(password);

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    throw new AppError("Este e-mail já está em uso.", 409, "EMAIL_IN_USE");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const createdUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: passwordHash
    }
  });

  return sanitizeUser(createdUser);
}

export async function loginUser({ email, password }) {
  const normalizedEmail = validateEmailFormat(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    throw new AppError("E-mail não cadastrado.", 401, "EMAIL_NOT_FOUND");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError("Senha inválida.", 401, "INVALID_CREDENTIALS");
  }

  return sanitizeUser(user);
}

export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
  }

  return sanitizeUser(user);
}
