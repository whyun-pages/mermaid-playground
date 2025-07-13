import { createClient } from '@supabase/supabase-js';
/**
 * @typedef {import('./index').DBAdapter} Supabase
 */
export class Supabase {
  constructor({ baseUrl, anonKey }) {
    this.client = createClient(
      baseUrl || import.meta.env.VITE_SUPABASE_URL,
      anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
  }
  async init() {
    //
  }
  async getAll() {
    const { data, error } = await this.client.from('mermaid').select();
    if (error) {
      console.error(error);
      throw error;
    } else {
      // console.log(data);
      return data;
    }
  }
  async add(data) {
    const { error, data: newData } = await this.client
      .from('mermaid')
      .insert(data)
      .select();
    if (error) {
      console.error('add error', error);
      throw error;
    } else {
      return newData[0];
    }
  }
  async update(id, data) {
    const { error } = await this.client
      .from('mermaid')
      .update(data)
      .eq('id', id);
    if (error) {
      console.error(error);
      throw error;
    }
  }
  async delete(id) {
    const { error } = await this.client.from('mermaid').delete().eq('id', id);
    if (error) {
      console.error(error);
      throw error;
    }
  }
}

// document.addEventListener('DOMContentLoaded', () => {
//   new Supabase().all();
// });
