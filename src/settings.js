import { Supabase } from './supabase';
import { IndexedDB } from './indexed';

export class Settings {
  constructor() {
    /**
     * @type {import('./index').DBAdapter}
     */
    this.db = null;
    this.settings = this.loadSettings();
    this.addEventListeners();
  }
  addEventListeners() {
    // 设置按钮
    const settingsBtn = document.getElementById('settings-btn');
    settingsBtn.addEventListener('click', () => {
      this.showSettingsModal();
    });

    // 设置窗体事件
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    const cancelSettings = document.getElementById('cancel-settings');
    const saveSettings = document.getElementById('save-settings');
    const storageType = document.getElementById('storage-type');

    // 关闭设置窗体
    closeSettings.addEventListener('click', () => {
      this.hideSettingsModal();
    });

    cancelSettings.addEventListener('click', () => {
      this.hideSettingsModal();
    });

    // 保存设置
    saveSettings.addEventListener('click', () => {
      this.saveSettingsFromForm();
      this.hideSettingsModal();
      alert('设置已保存！');
    });

    // 点击模态框外部关闭
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        this.hideSettingsModal();
      }
    });

    // 存储类型变化时显示/隐藏Supabase设置
    storageType.addEventListener('change', () => {
      const supabaseSettings = document.getElementById('supabase-settings');
      if (storageType.value === 'supabase') {
        supabaseSettings.classList.remove('hidden');
      } else {
        supabaseSettings.classList.add('hidden');
      }
    });
  }

  loadSettings() {
    const saved = localStorage.getItem('app-settings');
    return saved
      ? JSON.parse(saved)
      : {
          storage: {
            type: 'indexed-db',
            supabase: {
              url: '',
              key: '',
            },
          },
        };
  }
  /**
   * @returns {Promise<import('./index').DBAdapter>}
   */
  async getDB() {
    if (this.db) {
      return this.db;
    }
    let db;
    if (this.settings.storage.type === 'supabase') {
      db = new Supabase({
        baseUrl: this.settings.storage.supabase.url,
        anonKey: this.settings.storage.supabase.key,
      });
    } else {
      db = new IndexedDB();
    }
    await db.init();
    this.db = db;
    return this.db;
  }

  saveSettings() {
    localStorage.setItem('app-settings', JSON.stringify(this.settings));
  }

  showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    this.loadSettingsToForm();
  }

  hideSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('hidden');
  }

  loadSettingsToForm() {
    const storageType = document.getElementById('storage-type');
    const supabaseUrl = document.getElementById('supabase-url');
    const supabaseKey = document.getElementById('supabase-key');
    const supabaseSettings = document.getElementById('supabase-settings');

    storageType.value = this.settings.storage.type;
    supabaseUrl.value = this.settings.storage.supabase.url;
    supabaseKey.value = this.settings.storage.supabase.key;

    // 根据存储类型显示/隐藏Supabase设置
    if (this.settings.storage.type === 'supabase') {
      supabaseSettings.classList.remove('hidden');
    } else {
      supabaseSettings.classList.add('hidden');
    }
  }

  saveSettingsFromForm() {
    const storageType = document.getElementById('storage-type');
    const supabaseUrl = document.getElementById('supabase-url');
    const supabaseKey = document.getElementById('supabase-key');

    this.settings.storage.type = storageType.value;
    this.settings.storage.supabase.url = supabaseUrl.value;
    this.settings.storage.supabase.key = supabaseKey.value;
    this.db = null;
    this.saveSettings();
  }
}
