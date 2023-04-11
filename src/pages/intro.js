import {getState, setState} from '../state';

async function script() {
  console.log('hi alex!');
  setState('startTime', `${new Date()}`);
}

const content =
  /* html */
  `
<div>
    <p id="language">English | Español</p>
    <h1>49th Ward Participatory Budgeting</h1>
    <h2>2022 / 2023 cycle</h2>
    <h3>
        Welcome! You will be asked to select four (4) projects and decide how $1 million of the ward’s
        menu money should be allocated.
    </h3>
    
    <h3 class="blue">What happens after I vote?</h3>

    <p>
        Alderman Villegas will submit the projects that win the most votes, up to $1 million, to the City
        of Chicago for implementation. All the projects listed are feasible to the best of our knowledge, yet 
        require final approval from the City of Chicago or its sister agencies.
    </p>

    <p>
        While Alderman Villegas pledges to request funding and advocate for the winning projects, he
        cannot guarantee that the government agencies will grant final approval to each project request. If
        a winning project cannot be implemented for any reason, Alderman Villegas will use the allocated
        money to fund the next runner-up project that falls within the project.
    </p>

    <h2 id="voting">Voting Period: October 20 - November 30, 2022</h2>
</div>
`;

export default {content, script};
