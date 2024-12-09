
        // Base36 character set: 0-9, A-Z
    const BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // Function to convert a number to Base36
    function toBase36(num) {
        let result = "";
        do {
            result = BASE36[num % 36] + result;
            num = Math.floor(num / 36);
        } while (num > 0);
        return result;
    }

    // Function to generate a unique 7-character Base36 ID
    function generateBase36() {
        const timestamp = Date.now(); // Current time in milliseconds
        let base36Id = toBase36(timestamp); // Convert timestamp to Base36

        // Pad with leading zeros if the Base36 result is shorter than 7 characters
        while (base36Id.length < 7) {
            base36Id = "0" + base36Id;
        }

        // Ensure it's exactly 7 characters (truncate extra characters if needed)
        let code = base36Id.slice(-7);
        return code;
    }
