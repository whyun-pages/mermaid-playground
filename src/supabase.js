import { createClient } from '@supabase/supabase-js';

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
  async all() {
    const { data, error } = await this.client.from('mermaid').select();
    if (error) {
      console.error(error);
      return [];
    } else {
      console.log(data);
      return data;
    }
  }
  async create(data) {
    const { error, data: newData } = await this.client
      .from('mermaid')
      .insert(data);
    if (error) {
      console.error(error);
    } else {
      return newData;
    }
  }
  async update(data) {
    const { error } = await this.client
      .from('mermaid')
      .update(data)
      .eq('id', data.id);
    if (error) {
      console.error(error);
    }
  }
  async delete(id) {
    const { error } = await this.client.from('mermaid').delete().eq('id', id);
    if (error) {
      console.error(error);
    }
  }
}

// document.addEventListener('DOMContentLoaded', () => {
//   new Supabase().all();
// });
