import { Component } from "solid-js";

const FooterSection: Component = () => {
  return (
    <footer class="bg-white rounded-lg m-4 min-h-fit text-right mt-32">
      <div class="m-2">
        <p class="text-slate-600 font-semibold text-sm">
          I believe in user privacy. That's why this website collects absolutely
          no data (can be run offline!) – your experience is yours alone. Since
          I don't track anything, your feedback is invaluable. Let me know what
          you think on
          <a
            class=" text-amber-500 text-xl"
            href={"https://github.com/jerryliuoft/SilenceRemover/discussions"}
          >
            {" "}
            Github
          </a>
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
