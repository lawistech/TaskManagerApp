import { calculateDelta, isEqual, applyDelta, createDeltaOperation } from '../src/utils/deltaSync';

describe('Delta Sync Utilities', () => {
  describe('isEqual', () => {
    test('should correctly compare primitive values', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual('test', 'test')).toBe(true);
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
      
      expect(isEqual(1, 2)).toBe(false);
      expect(isEqual('test', 'test2')).toBe(false);
      expect(isEqual(true, false)).toBe(false);
      expect(isEqual(null, undefined)).toBe(false);
    });
    
    test('should correctly compare dates', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      const date3 = new Date('2023-01-02');
      
      expect(isEqual(date1, date2)).toBe(true);
      expect(isEqual(date1, date3)).toBe(false);
    });
    
    test('should correctly compare arrays', () => {
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(isEqual([1, 2, 3], [1, 2])).toBe(false);
    });
    
    test('should correctly compare objects', () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });
    
    test('should correctly compare nested objects', () => {
      expect(isEqual(
        { a: 1, b: { c: 2, d: [1, 2, 3] } },
        { a: 1, b: { c: 2, d: [1, 2, 3] } }
      )).toBe(true);
      
      expect(isEqual(
        { a: 1, b: { c: 2, d: [1, 2, 3] } },
        { a: 1, b: { c: 2, d: [1, 2, 4] } }
      )).toBe(false);
    });
  });
  
  describe('calculateDelta', () => {
    test('should return full object if old object is null', () => {
      const newObj = { id: '123', name: 'Test', value: 42 };
      expect(calculateDelta(null, newObj)).toEqual(newObj);
    });
    
    test('should return null if new object is null', () => {
      const oldObj = { id: '123', name: 'Test', value: 42 };
      expect(calculateDelta(oldObj, null)).toBeNull();
    });
    
    test('should return only changed fields', () => {
      const oldObj = { id: '123', name: 'Test', value: 42, unchanged: true };
      const newObj = { id: '123', name: 'Updated', value: 43, unchanged: true };
      
      expect(calculateDelta(oldObj, newObj)).toEqual({
        id: '123',
        name: 'Updated',
        value: 43
      });
    });
    
    test('should handle nested objects', () => {
      const oldObj = { 
        id: '123', 
        name: 'Test', 
        metadata: { 
          created: new Date('2023-01-01'),
          tags: ['tag1', 'tag2']
        }
      };
      
      const newObj = { 
        id: '123', 
        name: 'Test', 
        metadata: { 
          created: new Date('2023-01-01'),
          tags: ['tag1', 'tag3']
        }
      };
      
      expect(calculateDelta(oldObj, newObj)).toEqual({
        id: '123',
        metadata: { 
          created: new Date('2023-01-01'),
          tags: ['tag1', 'tag3']
        }
      });
    });
    
    test('should return null if no changes', () => {
      const obj = { id: '123', name: 'Test', value: 42 };
      expect(calculateDelta(obj, { ...obj })).toBeNull();
    });
  });
  
  describe('applyDelta', () => {
    test('should return base object if delta is null', () => {
      const baseObj = { id: '123', name: 'Test', value: 42 };
      expect(applyDelta(baseObj, null)).toEqual(baseObj);
    });
    
    test('should return delta if base object is null', () => {
      const delta = { id: '123', name: 'Test' };
      expect(applyDelta(null, delta)).toEqual(delta);
    });
    
    test('should correctly apply delta to base object', () => {
      const baseObj = { id: '123', name: 'Test', value: 42, unchanged: true };
      const delta = { id: '123', name: 'Updated', value: 43 };
      
      expect(applyDelta(baseObj, delta)).toEqual({
        id: '123',
        name: 'Updated',
        value: 43,
        unchanged: true
      });
    });
  });
  
  describe('createDeltaOperation', () => {
    test('should return full object for create operations', () => {
      const newData = { id: '123', name: 'Test', value: 42 };
      const operation = createDeltaOperation('create', 'task', null, newData);
      
      expect(operation).toEqual({
        type: 'create',
        entityType: 'task',
        data: newData,
        isDelta: false
      });
    });
    
    test('should return id only for delete operations', () => {
      const operation = createDeltaOperation('delete', 'task', null, { id: '123' });
      
      expect(operation).toEqual({
        type: 'delete',
        entityType: 'task',
        data: { id: '123' },
        isDelta: false
      });
    });
    
    test('should return delta for update operations', () => {
      const oldData = { id: '123', name: 'Test', value: 42, unchanged: true };
      const newData = { id: '123', name: 'Updated', value: 43, unchanged: true };
      
      const operation = createDeltaOperation('update', 'task', oldData, newData);
      
      expect(operation).toEqual({
        type: 'update',
        entityType: 'task',
        data: {
          id: '123',
          name: 'Updated',
          value: 43
        },
        isDelta: true
      });
    });
    
    test('should return null for update operations with no changes', () => {
      const data = { id: '123', name: 'Test', value: 42 };
      const operation = createDeltaOperation('update', 'task', data, { ...data });
      
      expect(operation).toBeNull();
    });
  });
});
