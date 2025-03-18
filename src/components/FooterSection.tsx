import { Component } from "solid-js";

const FooterSection: Component = () => {
  return (
    <footer class="bg-white rounded-lg m-4 min-h-fit text-right mt-32">
      <div class="m-4">
        <p class="text-slate-600 font-semibold text-sm">
          If you think this is cool why not check out my other apps like{" "}
          <a
            href={"https://midiband-eba3a.web.app/"}
            class=" text-purple-500 text-xl"
          >
            this
          </a>{" "}
          and
          <a
            class=" text-cyan-500 text-xl"
            href={"https://www.lexaloffle.com/bbs/?tid=46797"}
          >
            {" "}
            this
          </a>
        </p>
        <p class="text-slate-600 font-semibold text-sm">
          If you encountered any problems, feel free to send a PR at
          <a
            class=" text-amber-500 text-xl"
            href={"https://github.com/jerryliuoft/SilenceRemover"}
          >
            {" "}
            Source code
          </a>
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
