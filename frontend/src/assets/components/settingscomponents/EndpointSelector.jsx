import React, { useEffect, useState } from 'react';
import Select from 'react-select';

const EndpointSelector = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
      var localOption = localStorage.getItem('endpointType');
      if (localOption != null){
        setSelectedOption({value: localOption, label: localOption});
        setInputValue(localStorage.getItem('endpoint'));
      }
    }, []);

    const handleOptionChange = (selectedOption) => {
      setSelectedOption(selectedOption);
      setInputValue(getDefaultInputValue(selectedOption.value));
    };
    
    const handleConnectClick = () => {
        const url = ensureUrlFormat(inputValue)
        setInputValue(url);
        localStorage.setItem('endpointType', selectedOption.value);
        localStorage.setItem('endpoint', inputValue);
        setSelectedOption(localStorage.getItem('endpointType'), localStorage.getItem('endpoint'));
      };

    function ensureUrlFormat(str) {
        let url;
        try {
          url = new URL(str);
        } catch (error) {
          // If the provided string is not a valid URL, create a new URL
          url = new URL(`http://${str}/`);
        }
      
        return url.href;
      }
    
    const getDefaultInputValue = (option) => {
        switch (option) {
          case 'Kobold':
            return 'http://localhost:5000/';
          case 'OobaTextUI':
            return 'http://localhost:7861/';
          case 'AkikoBackend':
            return 'http://localhost:5100/' ;
          default:
            return 'http://localhost:5100/';
        }
      };
    
    const options = [
        { value: 'Kobold', label: 'Kobold' },
        { value: 'OobaTextUI', label: 'OobaTextUI' },
        { value: 'AkikoBackend', label: 'AkikoBackend' },
    ];
  
    return (
        <div className="settings-box" id='endpoint'>
          <h2>Text Generation Endpoint</h2>
          <div id='endpoint-container'>
        <form onSubmit={handleConnectClick}>
        <Select
        id="options"
        options={options}
        value={selectedOption}
        onChange={handleOptionChange}
        placeholder={selectedOption}
        />
        {selectedOption && (
            <input
            id="inputValue"
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={getDefaultInputValue(selectedOption.value)}
            />
        )}
        {selectedOption && (
            <button className="connect-button" type="submit">Connect</button>
        )}
        </form>
        </div>
        </div>
    );
  };
  
  export default EndpointSelector;
  