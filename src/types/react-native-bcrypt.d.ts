/**
 * Type declarations for react-native-bcrypt
 *
 * This module provides bcrypt hashing for React Native.
 */
declare module 'react-native-bcrypt' {
  /**
   * Generate a salt synchronously
   */
  function genSaltSync(rounds?: number): string;

  /**
   * Generate a salt asynchronously
   */
  function genSalt(rounds: number, callback: (error: Error | null, salt: string) => void): void;

  /**
   * Hash a string synchronously
   */
  function hashSync(data: string, salt: string): string;

  /**
   * Hash a string asynchronously
   */
  function hash(
    data: string,
    salt: string,
    callback: (error: Error | null, hash: string) => void
  ): void;

  /**
   * Compare a string with a hash synchronously
   */
  function compareSync(data: string, hash: string): boolean;

  /**
   * Compare a string with a hash asynchronously
   */
  function compare(
    data: string,
    hash: string,
    callback: (error: Error | null, result: boolean) => void
  ): void;

  /**
   * Get number of rounds used for the hash
   */
  function getRounds(hash: string): number;
}
