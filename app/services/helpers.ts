import { TokenMetaData } from '@/app/types/TokenMetaData';

/**
 * Finds an object in an array by its 'id' key.
 * @param array Array of objects
 * @param id The id to search for
 * @returns The matching object or undefined if not found
 */
export function findByAddress(array: TokenMetaData[], address: string): object | undefined {
  return array.find(item => {
    return item.address === address;
  });
}
