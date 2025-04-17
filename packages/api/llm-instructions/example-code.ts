import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

// Types
type RawRecord = {
  name: string;
  age: string;
  email: string;
};

type ProcessedRecord = {
  name: string;
  age: number;
  email: string;
  isAdult: boolean;
};

// Method to read and parse CSV
function readCSV(filePath: string): Promise<RawRecord[]> {
  return new Promise((resolve, reject) => {
    const results: RawRecord[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Method to process records
function processRecords(records: RawRecord[]): ProcessedRecord[] {
  return records.map((record) => ({
    name: record.name,
    age: parseInt(record.age, 10),
    email: record.email,
    isAdult: parseInt(record.age, 10) >= 18,
  }));
}

// Method to save processed data as CSV
function saveProcessedCSV(records: ProcessedRecord[], outputPath: string): void {
  const header = 'name,age,email,isAdult\n';
  const body = records
    .map((r) => `${r.name},${r.age},${r.email},${r.isAdult}`)
    .join('\n');

  fs.writeFileSync(outputPath, header + body, 'utf8');
  console.log(`✅ Processed CSV saved to: ${outputPath}`);
}

// Main workflow
async function main() {
  const inputPath = path.join(__dirname, 'input.csv');
  const outputPath = path.join(__dirname, 'output.csv');

  try {
    const rawData = await readCSV(inputPath);
    const processedData = processRecords(rawData);
    saveProcessedCSV(processedData, outputPath);
  } catch (err) {
    console.error('❌ Error processing CSV:', err);
  }
}

main();
