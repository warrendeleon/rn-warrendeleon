import { _internals, maskAndStringify, maskSensitiveData } from '../maskSensitiveData';

const { MASKED, maskString, maskByFieldName, looksLikeToken } = _internals;

describe('maskSensitiveData', () => {
  describe('null and undefined handling', () => {
    it('returns null for null input', () => {
      expect(maskSensitiveData(null)).toBeNull();
    });

    it('returns undefined for undefined input', () => {
      expect(maskSensitiveData(undefined)).toBeUndefined();
    });
  });

  describe('primitive handling', () => {
    it('returns numbers unchanged', () => {
      expect(maskSensitiveData(42)).toBe(42);
      expect(maskSensitiveData(3.14)).toBe(3.14);
      expect(maskSensitiveData(0)).toBe(0);
    });

    it('returns booleans unchanged', () => {
      expect(maskSensitiveData(true)).toBe(true);
      expect(maskSensitiveData(false)).toBe(false);
    });
  });

  describe('JWT token masking', () => {
    it('masks standalone JWT tokens', () => {
      const jwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      expect(maskSensitiveData(jwt)).toBe(MASKED.TOKEN);
    });

    it('masks Bearer tokens', () => {
      const bearerToken =
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(maskSensitiveData(bearerToken)).toBe(`Bearer ${MASKED.TOKEN}`);
    });

    it('masks Bearer tokens case-insensitively', () => {
      const bearerToken =
        'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test';
      // JWT pattern catches the token portion, resulting in masked output
      const result = maskSensitiveData(bearerToken) as string;
      expect(result).toContain(MASKED.TOKEN);
      expect(result).not.toContain('eyJ');
    });

    it('masks BEARER with uppercase', () => {
      const bearerToken = 'BEARER sometoken123.payload.signature';
      const result = maskSensitiveData(bearerToken) as string;
      expect(result).toContain(MASKED.TOKEN);
    });

    it('masks JWT tokens embedded in strings', () => {
      const str =
        'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test in header';
      const result = maskSensitiveData(str) as string;
      // JWT gets masked, result contains the token mask
      expect(result).toContain(MASKED.TOKEN);
      expect(result).not.toContain('eyJ');
      expect(result).toContain('Authorization:');
    });

    it('identifies long base64-like strings as tokens', () => {
      const longToken = 'abcdefghijklmnopqrstuvwxyz123456';
      expect(maskSensitiveData(longToken)).toBe(MASKED.TOKEN);
    });
  });

  describe('email masking', () => {
    it('masks email addresses in strings', () => {
      expect(maskSensitiveData('Contact: user@example.com')).toBe(`Contact: ${MASKED.EMAIL}`);
    });

    it('masks multiple email addresses', () => {
      const str = 'From: alice@test.org To: bob@company.co.uk';
      const result = maskSensitiveData(str);
      expect(result).toBe(`From: ${MASKED.EMAIL} To: ${MASKED.EMAIL}`);
    });

    it('masks emails with subdomains', () => {
      expect(maskSensitiveData('email: user@mail.example.com')).toBe(`email: ${MASKED.EMAIL}`);
    });

    it('masks emails with plus addressing', () => {
      expect(maskSensitiveData('user+tag@example.com')).toBe(MASKED.EMAIL);
    });

    it('masks emails with dots in local part', () => {
      expect(maskSensitiveData('first.last@example.com')).toBe(MASKED.EMAIL);
    });

    it('masks email field in objects', () => {
      const obj = { email: 'user@test.com', name: 'John' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.email).toBe(MASKED.EMAIL);
      expect(result.name).toBe('John');
    });

    it('masks emailAddress field', () => {
      const obj = { emailAddress: 'contact@example.com' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.emailAddress).toBe(MASKED.EMAIL);
    });

    it('masks userEmail field', () => {
      const obj = { userEmail: 'user@domain.com' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.userEmail).toBe(MASKED.EMAIL);
    });

    it('masks contactEmail field', () => {
      const obj = { contactEmail: 'support@company.com' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.contactEmail).toBe(MASKED.EMAIL);
    });
  });

  describe('password masking', () => {
    it('masks password field in objects', () => {
      const obj = { password: 'secret123' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.password).toBe(MASKED.PASSWORD);
    });

    it('masks newPassword field', () => {
      const obj = { newPassword: 'newSecret456' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.newPassword).toBe(MASKED.PASSWORD);
    });

    it('masks currentPassword field', () => {
      const obj = { currentPassword: 'oldPass' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.currentPassword).toBe(MASKED.PASSWORD);
    });

    it('masks confirmPassword field', () => {
      const obj = { confirmPassword: 'matchingPass' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.confirmPassword).toBe(MASKED.PASSWORD);
    });

    it('masks oldPassword field', () => {
      const obj = { oldPassword: 'previousPass' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.oldPassword).toBe(MASKED.PASSWORD);
    });

    it('masks password in JSON strings', () => {
      const jsonStr = '{"password": "secret123", "username": "john"}';
      const result = maskSensitiveData(jsonStr) as string;
      expect(result).toContain(`"password": "${MASKED.PASSWORD}"`);
      expect(result).toContain('"username": "john"');
    });

    it('masks multiple password fields in JSON strings', () => {
      const jsonStr = '{"password": "old", "newPassword": "new", "confirmPassword": "new"}';
      const result = maskSensitiveData(jsonStr) as string;
      expect(result).toContain(`"password": "${MASKED.PASSWORD}"`);
      expect(result).toContain(`"newPassword": "${MASKED.PASSWORD}"`);
      expect(result).toContain(`"confirmPassword": "${MASKED.PASSWORD}"`);
    });
  });

  describe('token and secret field masking', () => {
    it('masks token field', () => {
      const obj = { token: 'abc123token' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.token).toBe(MASKED.PASSWORD);
    });

    it('masks accessToken field', () => {
      const obj = { accessToken: 'access_abc123' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.accessToken).toBe(MASKED.PASSWORD);
    });

    it('masks refreshToken field', () => {
      const obj = { refreshToken: 'refresh_xyz789' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.refreshToken).toBe(MASKED.PASSWORD);
    });

    it('masks authToken field', () => {
      const obj = { authToken: 'auth_token_value' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.authToken).toBe(MASKED.PASSWORD);
    });

    it('masks bearerToken field', () => {
      const obj = { bearerToken: 'bearer_token_value' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.bearerToken).toBe(MASKED.PASSWORD);
    });

    it('masks idToken field', () => {
      const obj = { idToken: 'id_token_value' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.idToken).toBe(MASKED.PASSWORD);
    });

    it('masks sessionToken field', () => {
      const obj = { sessionToken: 'session_abc' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.sessionToken).toBe(MASKED.PASSWORD);
    });

    it('masks secret field', () => {
      const obj = { secret: 'mySecretValue' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.secret).toBe(MASKED.PASSWORD);
    });

    it('masks apiKey field', () => {
      const obj = { apiKey: 'sk_live_abc123' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.apiKey).toBe(MASKED.PASSWORD);
    });

    it('masks apiSecret field', () => {
      const obj = { apiSecret: 'api_secret_xyz' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.apiSecret).toBe(MASKED.PASSWORD);
    });

    it('masks pin field', () => {
      const obj = { pin: '1234' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.pin).toBe(MASKED.PASSWORD);
    });
  });

  describe('credit card and financial masking', () => {
    it('masks cvv field', () => {
      const obj = { cvv: '123' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.cvv).toBe(MASKED.PASSWORD);
    });

    it('masks cvc field', () => {
      const obj = { cvc: '456' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.cvc).toBe(MASKED.PASSWORD);
    });

    it('masks securityCode field', () => {
      const obj = { securityCode: '789' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.securityCode).toBe(MASKED.PASSWORD);
    });

    it('masks creditCard field', () => {
      const obj = { creditCard: '4111111111111111' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.creditCard).toBe(MASKED.PASSWORD);
    });

    it('masks cardNumber field', () => {
      const obj = { cardNumber: '4242424242424242' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.cardNumber).toBe(MASKED.PASSWORD);
    });

    it('masks accountNumber field', () => {
      const obj = { accountNumber: '12345678' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.accountNumber).toBe(MASKED.PASSWORD);
    });

    it('masks credit card numbers in strings', () => {
      expect(maskSensitiveData('Card: 4111-1111-1111-1111')).toBe(`Card: ${MASKED.CREDIT_CARD}`);
    });

    it('masks credit card with spaces', () => {
      expect(maskSensitiveData('4111 1111 1111 1111')).toBe(MASKED.CREDIT_CARD);
    });

    it('masks credit card without separators', () => {
      expect(maskSensitiveData('4111111111111111')).toBe(MASKED.CREDIT_CARD);
    });
  });

  describe('SSN and government ID masking', () => {
    it('masks ssn field', () => {
      const obj = { ssn: '123-45-6789' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.ssn).toBe(MASKED.PASSWORD);
    });

    it('masks socialSecurityNumber field', () => {
      const obj = { socialSecurityNumber: '987654321' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.socialSecurityNumber).toBe(MASKED.PASSWORD);
    });

    it('masks taxId field', () => {
      const obj = { taxId: '12-3456789' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.taxId).toBe(MASKED.PASSWORD);
    });

    it('masks SSN pattern in strings', () => {
      expect(maskSensitiveData('SSN: 123-45-6789')).toBe(`SSN: ${MASKED.SSN}`);
    });

    it('masks SSN with spaces', () => {
      expect(maskSensitiveData('123 45 6789')).toBe(MASKED.SSN);
    });

    it('masks UK National Insurance number', () => {
      expect(maskSensitiveData('NI: AB 12 34 56 C')).toBe(`NI: ${MASKED.SSN}`);
    });

    it('masks NI number without spaces', () => {
      expect(maskSensitiveData('AB123456C')).toBe(MASKED.SSN);
    });
  });

  describe('phone number masking', () => {
    it('masks phone field in objects', () => {
      const obj = { phone: '+447123456789' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.phone).toBe(MASKED.PHONE);
    });

    it('masks phoneNumber field', () => {
      const obj = { phoneNumber: '07123456789' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.phoneNumber).toBe(MASKED.PHONE);
    });

    it('masks mobile field', () => {
      const obj = { mobile: '+44 7123 456789' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.mobile).toBe(MASKED.PHONE);
    });

    it('masks mobileNumber field', () => {
      const obj = { mobileNumber: '07900123456' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.mobileNumber).toBe(MASKED.PHONE);
    });

    it('masks telephone field', () => {
      const obj = { telephone: '02012345678' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.telephone).toBe(MASKED.PHONE);
    });

    it('masks cell field', () => {
      const obj = { cell: '555-123-4567' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.cell).toBe(MASKED.PHONE);
    });

    it('masks cellPhone field', () => {
      const obj = { cellPhone: '(555) 123-4567' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.cellPhone).toBe(MASKED.PHONE);
    });

    it('masks UK phone numbers in strings', () => {
      expect(maskSensitiveData('Call: 07123456789')).toBe(`Call: ${MASKED.PHONE}`);
    });

    it('masks UK phone with +44', () => {
      expect(maskSensitiveData('+44 7123 456789')).toBe(MASKED.PHONE);
    });

    it('masks US phone numbers', () => {
      expect(maskSensitiveData('(555) 123-4567')).toBe(MASKED.PHONE);
    });

    it('masks US phone with country code', () => {
      expect(maskSensitiveData('+1-555-123-4567')).toBe(MASKED.PHONE);
    });

    it('masks international phone numbers', () => {
      // International numbers with spaces get partially masked
      const result = maskSensitiveData('+33 1 23 45 67 89') as string;
      expect(result).toContain(MASKED.PHONE);
    });
  });

  describe('address masking', () => {
    it('masks address field', () => {
      const obj = { address: '123 Main Street, London' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.address).toBe(MASKED.ADDRESS);
    });

    it('masks streetAddress field', () => {
      const obj = { streetAddress: '456 Oak Avenue' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.streetAddress).toBe(MASKED.ADDRESS);
    });

    it('masks street field', () => {
      const obj = { street: 'Baker Street' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.street).toBe(MASKED.ADDRESS);
    });

    it('masks addressLine1 field', () => {
      const obj = { addressLine1: 'Flat 1, 10 Downing Street' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.addressLine1).toBe(MASKED.ADDRESS);
    });

    it('masks addressLine2 field', () => {
      const obj = { addressLine2: 'Westminster' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.addressLine2).toBe(MASKED.ADDRESS);
    });

    it('masks fullAddress field', () => {
      const obj = { fullAddress: '123 Test Road, Test City, TC1 2AB' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.fullAddress).toBe(MASKED.ADDRESS);
    });

    it('masks homeAddress field', () => {
      const obj = { homeAddress: '789 Home Lane' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.homeAddress).toBe(MASKED.ADDRESS);
    });

    it('masks billingAddress field', () => {
      const obj = { billingAddress: '321 Billing Blvd' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.billingAddress).toBe(MASKED.ADDRESS);
    });

    it('masks shippingAddress field', () => {
      const obj = { shippingAddress: '654 Shipping St' };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      expect(result.shippingAddress).toBe(MASKED.ADDRESS);
    });
  });

  describe('nested object handling', () => {
    it('masks sensitive data in nested objects', () => {
      const obj = {
        user: {
          email: 'user@test.com',
          password: 'secret',
          profile: {
            phone: '07123456789',
            address: '123 Test St',
          },
        },
      };
      const result = maskSensitiveData(obj) as Record<string, unknown>;
      const user = result.user as Record<string, unknown>;
      const profile = user.profile as Record<string, unknown>;

      expect(user.email).toBe(MASKED.EMAIL);
      expect(user.password).toBe(MASKED.PASSWORD);
      expect(profile.phone).toBe(MASKED.PHONE);
      expect(profile.address).toBe(MASKED.ADDRESS);
    });

    it('preserves non-sensitive nested data', () => {
      const obj = {
        config: {
          theme: 'dark',
          language: 'en',
          settings: {
            notifications: true,
            volume: 80,
          },
        },
      };
      const result = maskSensitiveData(obj);
      expect(result).toEqual(obj);
    });
  });

  describe('array handling', () => {
    it('masks sensitive data in arrays', () => {
      const arr = ['user1@test.com', 'user2@example.org'];
      const result = maskSensitiveData(arr) as string[];
      expect(result).toEqual([MASKED.EMAIL, MASKED.EMAIL]);
    });

    it('masks sensitive data in arrays of objects', () => {
      const arr = [
        { email: 'a@b.com', name: 'Alice' },
        { email: 'c@d.com', name: 'Bob' },
      ];
      const result = maskSensitiveData(arr) as Record<string, unknown>[];
      const first = result[0] as Record<string, unknown>;
      const second = result[1] as Record<string, unknown>;
      expect(first.email).toBe(MASKED.EMAIL);
      expect(first.name).toBe('Alice');
      expect(second.email).toBe(MASKED.EMAIL);
      expect(second.name).toBe('Bob');
    });

    it('handles mixed arrays', () => {
      const arr = [42, 'test@email.com', true, { password: 'secret' }];
      const result = maskSensitiveData(arr) as unknown[];
      expect(result[0]).toBe(42);
      expect(result[1]).toBe(MASKED.EMAIL);
      expect(result[2]).toBe(true);
      expect((result[3] as Record<string, unknown>).password).toBe(MASKED.PASSWORD);
    });
  });

  describe('complex real-world scenarios', () => {
    it('masks API response with auth data', () => {
      const response = {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test',
          refreshToken: 'refresh_token_abc123',
          user: {
            id: 1,
            email: 'user@example.com',
            phone: '+447123456789',
          },
        },
      };
      const result = maskSensitiveData(response) as Record<string, unknown>;
      const data = result.data as Record<string, unknown>;
      const user = data.user as Record<string, unknown>;

      expect(result.success).toBe(true);
      expect(data.accessToken).toBe(MASKED.PASSWORD);
      expect(data.refreshToken).toBe(MASKED.PASSWORD);
      expect(user.id).toBe(1);
      expect(user.email).toBe(MASKED.EMAIL);
      expect(user.phone).toBe(MASKED.PHONE);
    });

    it('masks registration form data', () => {
      const formData = {
        email: 'newuser@test.com',
        password: 'MyS3cr3tP@ss!',
        confirmPassword: 'MyS3cr3tP@ss!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '07900123456',
        address: '123 Main St, London, SW1A 1AA',
      };
      const result = maskSensitiveData(formData) as Record<string, unknown>;

      expect(result.email).toBe(MASKED.EMAIL);
      expect(result.password).toBe(MASKED.PASSWORD);
      expect(result.confirmPassword).toBe(MASKED.PASSWORD);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.phone).toBe(MASKED.PHONE);
      expect(result.address).toBe(MASKED.ADDRESS);
    });

    it('masks error log with sensitive context', () => {
      const errorLog = {
        message: 'Authentication failed',
        context: {
          attemptedEmail: 'hacker@evil.com',
          token: 'invalid_token_xyz',
          headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZXN0IjoidGVzdCJ9.test',
          },
        },
      };
      const result = maskSensitiveData(errorLog) as Record<string, unknown>;
      const context = result.context as Record<string, unknown>;
      const headers = context.headers as Record<string, unknown>;

      expect(result.message).toBe('Authentication failed');
      expect(context.attemptedEmail).toContain(MASKED.EMAIL);
      expect(context.token).toBe(MASKED.PASSWORD);
      // Authorization header gets JWT masked (pattern-based)
      const authHeader = headers.Authorization as string;
      expect(authHeader).toContain(MASKED.TOKEN);
      expect(authHeader).not.toContain('eyJ');
    });
  });
});

describe('maskAndStringify', () => {
  it('returns masked string for string input', () => {
    expect(maskAndStringify('user@test.com')).toBe(MASKED.EMAIL);
  });

  it('returns JSON string for object input', () => {
    const obj = { email: 'test@example.com' };
    const result = maskAndStringify(obj);
    expect(result).toContain(MASKED.EMAIL);
    expect(result).toContain('"email"');
  });

  it('handles circular reference gracefully', () => {
    const obj: Record<string, unknown> = { name: 'test' };
    obj.self = obj; // Circular reference
    const result = maskAndStringify(obj);
    // Now handles circular refs with marker, so stringify works
    expect(result).toContain('name');
    expect(result).toContain('[Circular Reference]');
  });

  it('handles null', () => {
    expect(maskAndStringify(null)).toBe('null');
  });

  it('handles undefined', () => {
    expect(maskAndStringify(undefined)).toBe(undefined);
  });

  it('handles arrays', () => {
    const arr = ['test@email.com'];
    const result = maskAndStringify(arr);
    expect(result).toContain(MASKED.EMAIL);
  });

  it('handles unstringifiable data gracefully', () => {
    // BigInt values cause JSON.stringify to throw
    const obj = { value: BigInt(9007199254740991) };
    const result = maskAndStringify(obj);
    expect(result).toBe('[Unable to stringify data]');
  });
});

describe('internal helper functions', () => {
  describe('maskString', () => {
    it('masks Bearer tokens in strings', () => {
      const str = 'Auth: Bearer abc123.def456.ghi789';
      const result = maskString(str);
      expect(result).toContain(`Bearer ${MASKED.TOKEN}`);
    });

    it('masks password JSON patterns', () => {
      const str = '"secret": "mypassword"';
      const result = maskString(str);
      expect(result).toContain(`"secret": "${MASKED.PASSWORD}"`);
    });
  });

  describe('maskByFieldName', () => {
    it('returns original value for non-sensitive fields', () => {
      expect(maskByFieldName('name', 'John')).toBe('John');
      expect(maskByFieldName('age', 30)).toBe(30);
    });

    it('masks sensitive field values', () => {
      expect(maskByFieldName('password', 'secret')).toBe(MASKED.PASSWORD);
      expect(maskByFieldName('PASSWORD', 'secret')).toBe(MASKED.PASSWORD);
    });

    it('masks email field values', () => {
      expect(maskByFieldName('email', 'test@example.com')).toBe(MASKED.EMAIL);
      expect(maskByFieldName('EMAIL', 'test@example.com')).toBe(MASKED.EMAIL);
    });

    it('masks phone field values', () => {
      expect(maskByFieldName('phone', '1234567890')).toBe(MASKED.PHONE);
      expect(maskByFieldName('PHONE', '1234567890')).toBe(MASKED.PHONE);
    });

    it('masks address field values', () => {
      expect(maskByFieldName('address', '123 Main St')).toBe(MASKED.ADDRESS);
      expect(maskByFieldName('ADDRESS', '123 Main St')).toBe(MASKED.ADDRESS);
    });
  });

  describe('looksLikeToken', () => {
    it('identifies long base64-like strings as tokens', () => {
      expect(looksLikeToken('abcdefghijklmnopqrstuvwxyz')).toBe(true);
    });

    it('identifies JWT patterns as tokens', () => {
      const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJ0ZXN0IjoidGVzdCJ9.signature';
      expect(looksLikeToken(jwt)).toBe(true);
    });

    it('returns false for short strings', () => {
      expect(looksLikeToken('short')).toBe(false);
    });

    it('returns false for strings with special characters', () => {
      expect(looksLikeToken('hello world with spaces')).toBe(false);
    });
  });
});

describe('edge cases', () => {
  it('handles empty string', () => {
    expect(maskSensitiveData('')).toBe('');
  });

  it('handles empty object', () => {
    expect(maskSensitiveData({})).toEqual({});
  });

  it('handles empty array', () => {
    expect(maskSensitiveData([])).toEqual([]);
  });

  it('handles circular reference in arrays', () => {
    const arr: unknown[] = [1, 2, 3];
    arr.push(arr); // Create circular reference in array
    const result = maskSensitiveData(arr) as unknown[];
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(2);
    expect(result[2]).toBe(3);
    expect(result[3]).toBe('[Circular Reference]');
  });

  it('handles deeply nested structures', () => {
    const deep = {
      level1: {
        level2: {
          level3: {
            level4: {
              email: 'deep@nested.com',
            },
          },
        },
      },
    };
    const result = maskSensitiveData(deep) as Record<string, unknown>;
    const l1 = result.level1 as Record<string, unknown>;
    const l2 = l1.level2 as Record<string, unknown>;
    const l3 = l2.level3 as Record<string, unknown>;
    const l4 = l3.level4 as Record<string, unknown>;
    expect(l4.email).toBe(MASKED.EMAIL);
  });

  it('handles string with no sensitive data', () => {
    const str = 'This is a normal log message with no sensitive data';
    expect(maskSensitiveData(str)).toBe(str);
  });

  it('handles object with no sensitive fields', () => {
    const obj = { status: 200, message: 'OK', count: 42 };
    expect(maskSensitiveData(obj)).toEqual(obj);
  });
});
