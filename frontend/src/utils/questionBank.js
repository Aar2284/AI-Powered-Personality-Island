
export const QUESTION_BANK = {
    E: [
        "I enjoy being the center of attention.",
        "I like being the focus of everyone's interest.",
        "I am comfortable when all eyes are on me.",
        "I seek out situations where I can be noticed.",
        "I love having an audience.",
        "I don't mind standing out in a crowd.",
        "I actively seek the spotlight.",
        "I enjoy performing for others.",
        "I like to be the one talking in a group.",
        "I often take charge in social situations to be noticed.",
        "I feel energized when people are paying attention to me.",
        "I prefer being a protagonist rather than a spectator.",
        "I am naturally drawn to leadership roles where I am seen.",
        "I find it exciting to be the person everyone listens to.",
        "I am not afraid to draw attention to myself.",
        "I enjoy entertaining people.",
        "I like it when people talk about me.",
        "I thrive on external validation and attention.",
        "I am usually the life of the party.",
        "I make sure my presence is known in a room."
    ],
    N: [
        "I get stressed out easily.",
        "I often feel overwhelmed by daily tasks.",
        "I worry about things more than most people.",
        "I have a hard time relaxing when things are uncertain.",
        "I am easily disturbed by unexpected events.",
        "I feel anxious without a clear reason.",
        "I often feel tense or jittery.",
        "Small problems can make me very upset.",
        "I frequently feel down or blue.",
        "I am prone to mood swings.",
        "I often dwell on past mistakes.",
        "I find it difficult to stay calm under pressure.",
        "I am easily irritated by minor annoyances.",
        "I often fear the worst will happen.",
        "I feel vulnerable to criticism.",
        "I panic easily in difficult situations.",
        "I struggle to cope with stress.",
        "I often feel emotionally unstable.",
        "I am sensitive to my environment and how others treat me.",
        "I frequently doubt my abilities to handle challenges."
    ],
    A: [
        "I make people feel at ease.",
        "I am good at comforting others.",
        "I know how to make people feel welcome.",
        "I am naturally empathetic towards others.",
        "I try to be helpful to everyone I meet.",
        "I care about how others are feeling.",
        "I am generally a warm and friendly person.",
        "I try to anticipate the needs of others.",
        "I am interested in people and their lives.",
        "I respect others' points of view even if I disagree.",
        "I find it easy to sympathize with others' problems.",
        "I treat everyone with kindness and respect.",
        "I am not one to hold a grudge.",
        "I value harmony in my relationships.",
        "I am often the one to smooth over conflicts.",
        "I enjoy making others happy.",
        "I am attentive to the feelings of those around me.",
        "I believe that most people are basically good.",
        "I am willing to compromise to get along.",
        "I try to see the best in people."
    ],
    C: [
        "I am always prepared.",
        "I plan ahead for future events.",
        "I like to have a schedule and stick to it.",
        "I am diligent about finishing what I start.",
        "I pay attention to the details.",
        "I keep my belongings neat and organized.",
        "I dislike being late or disorganized.",
        "I work hard to achieve my goals.",
        "I am reliable and can be counted on.",
        "I follow through on my promises.",
        "I am careful and thorough in my work.",
        "I prefer a structured environment.",
        "I make lists to ensure I don't forget things.",
        "I prioritize my responsibilities.",
        "I am self-disciplined and efficient.",
        "I set high standards for myself.",
        "I am methodical in my approach to tasks.",
        "I avoid procrastination.",
        "I take my duties seriously.",
        "I like to have everything in its proper place."
    ],
    O: [
        "I have a vivid imagination.",
        "I enjoy getting lost in daydreams.",
        "I come up with new ideas easily.",
        "I am curious about how things work.",
        "I appreciate art and beauty.",
        "I enjoy thinking about complex theories.",
        "I like to explore new places and cultures.",
        "I am open to new experiences.",
        "I have a rich inner life.",
        "I enjoy solving creative problems.",
        "I am interested in abstract concepts.",
        "I often think outside the box.",
        "I am moved by poetry and music.",
        "I like to challenge established views.",
        "I am always learning something new.",
        "I see connections that others miss.",
        "I enjoy philosophical discussions.",
        "I am inventive and original.",
        "I find routine boring and seek variety.",
        "I have a broad range of interests."
    ]
};

export const getRandomQuestions = () => {
    // Returns an array of 5 question objects, one for each trait
    const traits = [
        { id: 'E', label: 'EXTRAVERSION' },
        { id: 'N', label: 'NEUROTICISM' },
        { id: 'A', label: 'AGREEABLENESS' },
        { id: 'C', label: 'CONSCIENTIOUSNESS' },
        { id: 'O', label: 'OPENNESS' }
    ];

    return traits.map(trait => {
        const pool = QUESTION_BANK[trait.id];
        const randomIndex = Math.floor(Math.random() * pool.length);
        return {
            id: trait.id,
            label: trait.label,
            text: pool[randomIndex]
        };
    });
};
