import Joi from 'joi';

const REQUIRED = 'Required field';

export default {
  error: Joi.object().keys({
    ip: Joi.string().required().messages({ '*': REQUIRED }),
    company: Joi.string().required().messages({ '*': REQUIRED }),
    word: Joi.string().required().messages({ '*': REQUIRED }),
  }),
  warning: Joi.object().keys({
    ip: Joi.string().ip().messages({
      '*': 'This is not a correctly formatted IP address. Expected valid IPv4 or IPv6 address',
    }),
    company: Joi.string()
      .pattern(/^([A-Z]|[a-z]|[0-9]| )+$/)
      .messages({
        '*': `It's unusual to have symbols in company names`,
      }),
    word: Joi.string()
      .pattern(/^(?!(turd|poop|shit|feaces|excrement)).*$/i)
      .messages({
        '*': 'I get it. Poop is funny. But are you sure?',
      }),
  }),
};
