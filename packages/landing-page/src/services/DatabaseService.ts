import { supabase } from "@/integrations/supabase/client";

export class DatabaseService {
  static async incrementDownloadCount(os: number): Promise<void> {
    console.log('Incrementing download count for OS:', os);
    
    try {
      // First get the current count
      const { data: currentData, error: fetchError } = await supabase
        .from('downloads')
        .select('count')
        .eq('os', os)
        .single();

      if (fetchError) {
        console.error('Error fetching current count:', fetchError);
        return;
      }

      const currentCount = currentData?.count || 0;
      const newCount = currentCount + 1;

      // Update with new count using raw SQL to ensure atomic update
      const { error } = await supabase
        .from('downloads')
        .update({ count: newCount })
        .eq('os', os);

      if (error) {
        console.error('Error incrementing download count:', error);
        return;
      }

      console.log('Download count updated successfully for OS:', os, 'New count:', newCount);
    } catch (error) {
      console.error('Error in incrementDownloadCount:', error);
    }
  }

  static async getDownloadCount(): Promise<number> {
    console.log('Fetching total download count from Supabase...');
    
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('count');

      if (error) {
        console.error('Error fetching download count:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        console.info('No download data found, returning 0');
        return 0;
      }

      const totalCount = data.reduce((sum, row) => sum + (row.count || 0), 0);
      console.log('Total download count fetched:', totalCount);
      return totalCount;
    } catch (error) {
      console.error('Error in getDownloadCount:', error);
      return 0;
    }
  }
}