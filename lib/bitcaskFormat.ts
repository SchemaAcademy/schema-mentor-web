/** Fixed header size: timestamp + key_len + value_len (all uint32 BE). */
export const BITCASK_HEADER_SIZE = 12;

export type KeydirEntry = {
  /** Byte offset in the log where the value bytes start. */
  valuePos: number;
  valueSize: number;
  timestamp: number;
};
