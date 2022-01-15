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
  const [value, setValue] = React.useState(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        label={label}
        value={value}
        onChange={(newValue) => {
          if (newValue != null){
            setValue(newValue);
            console.log(new Date(newValue).getTime());
            onChange(identifier);
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
