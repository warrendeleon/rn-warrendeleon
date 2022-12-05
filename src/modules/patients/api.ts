import {Patient} from '../../models/Patient';
import Papa, {ParseResult} from 'papaparse';

export const getPatientsService = async (
  clinicId: number,
): Promise<ParseResult<Patient>> => {
  let res: ParseResult<Patient> = {
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
    `https://raw.githubusercontent.com/salvehealth/tech-test-data/master/patients-${clinicId}.csv`,
    {
      header: true,
      delimiter: ',',
      download: true,
      skipEmptyLines: true,
      complete(results: ParseResult<Patient>) {
        res = results;
      },
    },
  );

  return res;
};
