export const storeName = 'mermaid';
export class IndexedDB {
  /**
   * 构造函数
   * @param {Object} storeConfig 对象仓库配置 {storeName: {keyPath, autoIncrement, indexes}}
   */
  constructor() {
    this.dbName = 'mermaid_db';
    this.dbVersion = 1;
    this.storeConfig = {
      [storeName]: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: {
          nameIndex: { path: 'name', unique: false },
          codeIndex: { path: 'code', unique: false },
        },
      },
    };
    /**
     * @type {IDBDatabase}
     */
    this.db = null;
  }

  /**
   * 打开数据库连接
   * @returns {Promise<IDBDatabase>}
   */
  init() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        reject(`数据库打开失败: ${event.target.error}`);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 创建或更新对象仓库
        for (const [storeName, config] of Object.entries(this.storeConfig)) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, {
              keyPath: config.keyPath,
              autoIncrement: config.autoIncrement,
            });

            // 创建索引
            if (config.indexes) {
              for (const [indexName, indexConfig] of Object.entries(
                config.indexes,
              )) {
                store.createIndex(indexName, indexConfig.path, {
                  unique: indexConfig.unique || false,
                });
              }
            }
          }
        }
      };
    });
  }

  /**
   * 关闭数据库连接
   */
  closeDB() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * 添加数据
   * @param {Object} data 要添加的数据
   * @returns {Promise<IDBValidKey>}
   */
  add(data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(`添加数据失败: ${event.target.error}`);
      };
    });
  }

  /**
   * 更新数据
   * @param {Object} data 要更新的数据，必须包含keyPath指定的属性
   * @returns {Promise<IDBValidKey>}
   */
  update(data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(`更新数据失败: ${event.target.error}`);
      };
    });
  }

  /**
   * 删除数据
   * @param {IDBValidKey} key 要删除的数据的主键值
   * @returns {Promise<void>}
   */
  delete(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(`删除数据失败: ${event.target.error}`);
      };
    });
  }

  /**
   * 查询单条数据
   * @param {IDBValidKey} key 要查询的数据的主键值
   * @returns {Promise<Object>}
   */
  get(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(`查询数据失败: ${event.target.error}`);
      };
    });
  }

  /**
   * 查询所有数据
   * @returns {Promise<Array>}
   */
  getAll() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(`查询所有数据失败: ${event.target.error}`);
      };
    });
  }

  /**
   * 通过索引查询数据
   * @param {string} storeName 对象仓库名称
   * @param {string} indexName 索引名称
   * @param {IDBValidKey} key 索引值
   * @returns {Promise<Array>}
   */
  getByIndex(indexName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(key);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(`通过索引查询数据失败: ${event.target.error}`);
      };
    });
  }

  /**
   * 清空对象仓库
   * @returns {Promise<void>}
   */
  clear() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(`清空对象仓库失败: ${event.target.error}`);
      };
    });
  }

  /**
   * 删除数据库
   * @returns {Promise<void>}
   */
  deleteDB() {
    return new Promise((resolve, reject) => {
      this.closeDB();
      const request = indexedDB.deleteDatabase(this.dbName);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(`删除数据库失败: ${event.target.error}`);
      };
    });
  }
}
