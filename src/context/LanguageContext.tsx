import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

export type Language = "en" | "ml" | "kn";

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LANGUAGES: { id: Language; label: string; nativeLabel: string }[] = [
    { id: "en", label: "English", nativeLabel: "English" },
    { id: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
    { id: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
];

const translations: Record<Language, Record<string, string>> = {
    en: {
        "select_start": "Select Start Point",
        "select_destination": "Select Destination",
        "get_directions": "Get Directions",
        "start_navigation": "Start Navigation",
        "restart_navigation": "Restart Navigation",
        "im_lost": "I'm Lost! Re-center",
        "you_are_here": "You are here",
        "distance": "Distance",
        "steps": "Steps",
        "floor": "Floor",
        "ground_floor": "Ground Floor",
        "search_placeholder": "Search locations...",
        "start_point": "Start Point",
        "destination": "Destination",
        "admin_panel": "Admin Panel",
        "home": "Home",
        "next_step": "Next Step",
        "back": "Back",
        "arrived": "You've arrived!",
        "navigate_elsewhere": "Navigate Somewhere Else",
        "step_counter": "Step ",
        "of": " of ",
        "where_to": "Where to?",
        "select_path_msg": "Select your path to start guiding.",
        "icon_straight": "Go Straight",
        "icon_left": "Turn Left",
        "icon_right": "Turn Right",
        "icon_stairs_up": "Stairs Up",
        "icon_stairs_down": "Stairs Down",
        "icon_lift_up": "Lift Up",
        "icon_lift_down": "Lift Down",
        "icon_destination": "Destination",
        "icon_start": "Start",
        "greeting_morning": "Good Morning",
        "greeting_afternoon": "Good Afternoon",
        "greeting_evening": "Good Evening",
        "where_would_you_like_to_go": "Where would you like to go?",
        "quick_access": "Quick Access",
        "qa_cafeteria": "Cafeteria",
        "qa_restroom": "Restroom",
        "qa_exit": "Exit",
        "qa_office": "Office",
        "offline_capable": "Offline Capable",
        "no_gps_needed": "No GPS Needed",
    },
    ml: {
        "select_start": "തുടങ്ങുന്ന സ്ഥലം തിരഞ്ഞെടുക്കുക",
        "select_destination": "ലക്ഷ്യസ്ഥാനം തിരഞ്ഞെടുക്കുക",
        "get_directions": "വഴികൾ കാണിക്കുക",
        "start_navigation": "നാവിഗേഷൻ ആരംഭിക്കുക",
        "restart_navigation": "വീണ്ടും തുടങ്ങുക",
        "im_lost": "എനിക്ക് വഴി തെറ്റി! സഹായിക്കൂ",
        "you_are_here": "നിങ്ങൾ ഇവിടെയാണ്",
        "distance": "ദൂരം",
        "steps": "ചുവടുകൾ",
        "floor": "നില",
        "ground_floor": "താഴത്തെ നില",
        "search_placeholder": "സ്ഥലങ്ങൾ തിരയുക...",
        "start_point": "തുടങ്ങുന്ന സ്ഥലം",
        "destination": "ലക്ഷ്യസ്ഥാനം",
        "admin_panel": "അഡ്മിൻ പാനൽ",
        "home": "ഹോം",
        "next_step": "അടുത്തത്",
        "back": "തിരികെ",
        "arrived": "നിങ്ങൾ എത്തിച്ചേർന്നു!",
        "navigate_elsewhere": "മറ്റൊരു സ്ഥലത്തേക്ക് പോകുക",
        "step_counter": "ചുവട് ",
        "of": " / ",
        "where_to": "എങ്ങോട്ടാണ് പോകേണ്ടത്?",
        "select_path_msg": "വഴികാട്ടി തുടങ്ങാൻ നിങ്ങളുടെ പാത തിരഞ്ഞെടുക്കുക.",
        "icon_straight": "നേരെ പോകുക",
        "icon_left": "ഇടത്തോട്ട്",
        "icon_right": "വലത്തോട്ട്",
        "icon_stairs_up": "പടികൾ കയറുക",
        "icon_stairs_down": "പടികൾ ഇറങ്ങുക",
        "icon_lift_up": "ലിഫ്റ്റ് മുകളിലേക്ക്",
        "icon_lift_down": "ലിഫ്റ്റ് താഴേക്ക്",
        "icon_destination": "ലക്ഷ്യസ്ഥാനം",
        "icon_start": "തുടക്കം",
        "greeting_morning": "ശുഭപ്രഭാതം",
        "greeting_afternoon": "ശുഭദിനം",
        "greeting_evening": "ശുഭരാത്രി",
        "where_would_you_like_to_go": "നിങ്ങൾക്ക് എങ്ങോട്ടാണ് പോകേണ്ടത്?",
        "quick_access": "വേഗത്തിലുള്ള പ്രവേശനം",
        "qa_cafeteria": "കഫറ്റീരിയ",
        "qa_restroom": "ശുചിമുറി",
        "qa_exit": "പുറത്തേക്കുള്ള വഴി",
        "qa_office": "ഓഫീസ്",
        "offline_capable": "ഓഫ്‌ലൈനിൽ ഉപയോഗിക്കാം",
        "no_gps_needed": "GPS ആവശ്യമില്ല",
    },
    kn: {
        "select_start": "ಪ್ರಾರಂಭ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        "select_destination": "ಗಮ್ಯಸ್ಥಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        "get_directions": "ದಿಕ್ಕುಗಳನ್ನು ಪಡೆಯಿರಿ",
        "start_navigation": "ನ್ಯಾವಿಗೇಷನ್ ಪ್ರಾರಂಭಿಸಿ",
        "restart_navigation": "ಮರುಪ್ರಾರಂಭಿಸಿ",
        "im_lost": "ನಾನು ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ! ಮರು-ಕೇಂದ್ರೀಕರಿಸಿ",
        "you_are_here": "ನೀವು ಇಲ್ಲಿದ್ದೀರಿ",
        "distance": "ದೂರ",
        "steps": "ಹೆಜ್ಜೆಗಳು",
        "floor": "ಮಹಡಿ",
        "ground_floor": "ನೆಲ ಅಂತಸ್ತು",
        "search_placeholder": "ಸ್ಥಳಗಳನ್ನು ಹುಡುಕಿ...",
        "start_point": "ಪ್ರಾರಂಭ ಸ್ಥಳ",
        "destination": "ಗಮ್ಯಸ್ಥಾನ",
        "admin_panel": "ನಿರ್ವಾಹಕ ಫಲಕ",
        "home": "ಮುಖಪುಟ",
        "next_step": "ಮುಂದೆ",
        "back": "ಹಿಂದೆ",
        "arrived": "ನೀವು ತಲುಪಿದ್ದೀರಿ!",
        "navigate_elsewhere": "ಬೇರೆಡೆಗೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ",
        "step_counter": "ಹಂತ ",
        "of": " / ",
        "where_to": "ಎಲ್ಲಿಗೆ?",
        "select_path_msg": "ಮಾರ್ಗದರ್ಶನ ಮಾಡಲು ನಿಮ್ಮ ಮಾರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        "icon_straight": "ನೇರವಾಗಿ ಹೋಗಿ",
        "icon_left": "ಎಡಕ್ಕೆ ತಿರುಗಿ",
        "icon_right": "ಬಲಕ್ಕೆ ತಿರುಗಿ",
        "icon_stairs_up": "ಮೆಟ್ಟಿಲು ಮೇಲೆ",
        "icon_stairs_down": "ಮೆಟ್ಟಿಲು ಕೆಳಗೆ",
        "icon_lift_up": "ಲಿಫ್ಟ್ ಮೇಲೆ",
        "icon_lift_down": "ಲಿಫ್ಟ್ ಕೆಳಗೆ",
        "icon_destination": "ಗಮ್ಯಸ್ಥಾನ",
        "icon_start": "ಪ್ರಾರಂಭ",
        "greeting_morning": "ಶುಭೋದಯ",
        "greeting_afternoon": "ಶುಭ ಮಧ್ಯಾಹ್ನ",
        "greeting_evening": "ಶುಭ ಸಂಜೆ",
        "where_would_you_like_to_go": "ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗಲು ಬಯಸುತ್ತೀರಿ?",
        "quick_access": "ತ್ವರಿತ ಪ್ರವೇಶ",
        "qa_cafeteria": "ಕ್ಯಾಫೆಟೇರಿಯಾ",
        "qa_restroom": "ಶೌಚಾಲಯ",
        "qa_exit": "ನಿರ್ಗಮನ",
        "qa_office": "ಕಚೇರಿ",
        "offline_capable": "ಆಫ್‌ಲೈನ್ ಸಾಮರ್ಥ್ಯ",
        "no_gps_needed": "GPS ಅಗತ್ಯವಿಲ್ಲ",
    },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem("app-language");
        return (saved as Language) || "en";
    });

    useEffect(() => {
        localStorage.setItem("app-language", language);
        document.documentElement.lang = language;
    }, [language]);

    const t = useCallback((key: string): string => {
        return translations[language][key] || translations["en"][key] || key;
    }, [language]);

    const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
    return context;
};
