import {Clinic} from '../../models/Clinic';
import Papa, {ParseResult} from 'papaparse';

export const getClinicsService = async (): Promise<ParseResult<Clinic>> => {
  let res: ParseResult<Clinic> = {
    data: [],
    errors: [],
    meta: {
      delimiter: '',
      linebreak: '',
      aborted: false,
      truncated: false,
      cursor: 0,
    },
  };

  Papa.parse(
    'https://raw.githubusercontent.com/salvehealth/tech-test-data/master/clinics.csv',
    {
      header: true,
      delimiter: ',',
      download: true,
      skipEmptyLines: true,
      complete(results: ParseResult<Clinic>) {
        res = results;
      },
    },
  );

  return res;
};
