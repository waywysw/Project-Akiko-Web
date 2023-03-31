import React, {useState, useEffect} from "react";
import "../assets/css/character.css";
import "../assets/css/settings.css";
import { getCharacterImageUrl, fetchCharacter, updateAdvancedCharacter, fetchAdvancedCharacterEmotion } from "../assets/components/api";
import EmotionSprites from "../assets/components/advancedcharactercomponents/EmotionSprites";

const AdvancedCharacter = () => {
    const [character, setCharacter] = useState(null);
    const [characterAvatar, setCharacterAvatar] = useState(null);
    useEffect(() => {
        const fetchCharacterData = async () => {
            var selectedChar = localStorage.getItem('selectedCharacter');
            if (selectedChar) {
                console.log(selectedChar);
                selectedChar = await fetchCharacter(selectedChar);
                setCharacter(selectedChar); // set the state to the character object
                setCharacterAvatar(getCharacterImageUrl(selectedChar.avatar));
            }
        };
        fetchCharacterData();
    }, []);

    return (
        <div>
        {character && (
        <>
            <h1 className="settings-panel-header">{character === null ? 'Placeholder' : character.name} - Advanced Settings</h1><div className="settings-panel">
            <EmotionSprites />
            </div>
        </>
        )}
        </div>
    )
};
export default AdvancedCharacter;