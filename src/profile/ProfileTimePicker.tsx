import * as React from 'react';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TimePicker from '@mui/lab/TimePicker';

type ProfileTimePickerProps = {
  label: string,
  identifier: string,
  onChange: Function,
}

export default function ProfileTimePicker({label, identifier, onChange}: ProfileTimePickerProps) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        label={label}
        value={value}
        onChange={(newValue) => {
          if (newValue != null){
            const hour = parseInt(newValue.toString().split(" ")[4].split(":")[0]).toString();
            setValue(newValue);
            onChange(identifier, hour);
          }
        }}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}

export interface TimeslotObject {
    day: string,
    start_time: string,
    end_time: string,
}
