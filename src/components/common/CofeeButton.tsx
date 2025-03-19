import bmcButton from "../../assets/bmc-button.svg";

const CoffeeButton = () => {
  return (
    <div class="mr-4">
      <a
        href="https://buymeacoffee.com/whoisjerryli"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={bmcButton} alt="Buy Me A Coffee" style={{ height: "40px" }} />
      </a>
    </div>
  );
};

export default CoffeeButton;
