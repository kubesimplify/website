
import chadMCrowell from '../components/liveworkshop/assests/Speaker_Imgs/ChadMCrowell.jpeg'
import dan_garfield from '../components/liveworkshop/assests/Speaker_Imgs/dan-garfield.jpeg'
import david from '../components/liveworkshop/assests/Speaker_Imgs/DavidFlanagan.png'
import saiyam from '../components/liveworkshop/assests/Speaker_Imgs/Saiyam-Pathak.jpg'
import kamesh from '../components/liveworkshop/assests/Speaker_Imgs/kamesh-sampath.png'
import karthik from '../components/liveworkshop/assests/Speaker_Imgs/karthik.png'
import lee from '../components/liveworkshop/assests/Speaker_Imgs/lee-calcote.webp'
import micheal from '../components/liveworkshop/assests/Speaker_Imgs/micheal-friedrich.jpeg'
import rewanth from '../components/liveworkshop/assests/Speaker_Imgs/Rewanth-Tammana.jpeg'

export const workshopData = [
    {
      coverPhoto: chadMCrowell,
      workshopName: "Linux & Docker Fundamentals",
      date: "July 11th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "This workshop aims to build a solid Linux and Docker foundation. You will learn about Linux fundamentals, containers and Docker.",
      workshopLink:
        "https://youtu.be/EUu1E_YKGTw",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: saiyam,
      workshopName: "Kubernetes 101",
      date: "July 18th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "This workshop helps you learn Kubernetes from scratch. Some of the topics include K8s fundamentals, Pods, Deployments, Services, Ingress & more.",
      workshopLink:
        "https://youtu.be/PN3VqbZqmD8",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: dan_garfield,
      workshopName: "GitOps With ArgoCD",
      date: "July 25th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop you will learn the theory of GitOps and also apply all of those practices in your own application using the Argo project family.",
      workshopLink:
        "https://youtu.be/5rwIIusbUWM",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: rewanth,
      workshopName: "Kubernetes Security 101",
      date: "Aug 1st, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In the previous workshops, you learned about the basics of Docker & Kubernetes. This workshop aims to kick a notch higher by introducing you to the security aspects of the container world.",
      workshopLink:
        "https://youtu.be/ka0C09CAfho",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: karthik,
      workshopName: "Chaos Engineering with LitmusChaos",
      date: "Aug 24th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop, we'll be learning to setup a chaos engineering tool - LitmusChaos (CNCF Incubating project)",
      workshopLink:
        "https://youtu.be/259I52_Zh3E",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: lee,
      workshopName: "Service Mesh",
      date: "Aug 31st, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop, Lee Calcote will be going over through the fundamentals of Service Mesh starting from the scratch and covering various essentials topics through Hands-On Labs.",
      workshopLink:
        "https://youtu.be/9KC4Jgtz_j4",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: david,
      workshopName: "Kubernetes Troubleshooting",
      date: "Sept 12th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop, we will learn how to operate and manage a Kubernetes cluster by debugging some clusters broken by members of the Kubernetes Community.",
      workshopLink:
        "https://youtu.be/cRAA1B4R-1U",
        workshopStatus: "Watch Recording",
    },
    {
      coverPhoto: micheal,
      workshopName: "Kubernetes Observability",
      date: "Sept 19th, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop by Michael, you will learn the basics of Monitoring and Observability with microservices and container clusters.",
      workshopLink:
        "https://youtu.be/sMEEVbZ4NFM",
        workshopStatus: "Watch Now",
    },
    {
      coverPhoto: kamesh,
      workshopName: "CI + GitOps with Cloud Native Java",
      date: "Oct 21st, 2022",
      time: "07:00 AM PT",
      workshopDesc:
        "In this workshop, Kamesh Sampath will lead us through the journey of deploying our simple java application, with the help of a toolchain made with DroneCI, ArgoCD.",
      workshopLink:
        "https://forms.gle/mexwhLULBaQKywxJ6",
        workshopStatus: "Register Now",
    },
  ];



// If we have no coverPhoto link we cam just simply remove the coverphoto line in the teamData  and it will show the default image 

export const teamData = [
    {
        name: 'Aayush Sharma',
        coverPhoto: 'https://avatars.githubusercontent.com/u/78820926?v=4',
        twitterLink: 'https://twitter.com/SuperAayush14',
        linkedinLink: 'https://www.linkedin.com/in/superaayush/',
        githubLink: 'https://github.com/SuperAayush'
    },
    {
        name: 'Avinesh Tripathi',
        coverPhoto: 'https://avatars.githubusercontent.com/u/73980067?v=4',
        twitterLink: 'https://twitter.com/Avinesh__T',
        linkedinLink: 'https://www.linkedin.com/in/avineshtripathi/',
        githubLink: 'https://github.com/AvineshTripathi'
    },
    {
        name: 'Vaidansh Bhardwaj',
        coverPhoto: 'https://media.discordapp.net/attachments/1016265994278289429/1016300749807943690/IMG_20211228_002744.jpg?width=598&height=598',
        twitterLink: 'https://twitter.com/vaidansh23',
        linkedinLink: 'https://www.linkedin.com/in/vaidanshbhardwaj',
        githubLink: 'https://github.com/vaidanshbhardwaj'
    },
    {
        name: 'Aditya Tripathi',
        coverPhoto: 'https://media.discordapp.net/attachments/1016265994278289429/1016301861642453073/Aditya_Tripathi.jpg?width=324&height=358',
        twitterLink: 'https://twitter.com/AdityaT94776666',
        linkedinLink: 'https://www.linkedin.com/in/aditya-tripathi-7108911ab/',
        githubLink: 'https://github.com/aditya5573'
    },
    {
        name: 'Lavakush Biyani',
        coverPhoto: 'https://media.discordapp.net/attachments/1016265994278289429/1016305209905000508/My_pic.jpg',
        twitterLink: 'https://twitter.com/lavkushbiyani1',
        linkedinLink: 'https://www.linkedin.com/in/lavkush-biyani-07/',
        githubLink: 'https://github.com/lavakush07'
    },
    {
        name: 'Pawan Gudiwala',
        coverPhoto: 'https://media.discordapp.net/attachments/1016265994278289429/1016307938157154324/index.png',
        twitterLink: 'https://twitter.com/pavangudiwada_',
        linkedinLink: 'https://www.linkedin.com/in/pavangudiwada/',
        githubLink: ''
    },
    {
        name: 'Kunal Verma',
        coverPhoto: 'https://avatars.githubusercontent.com/u/72245772?v=4',
        twitterLink: 'https://twitter.com/kverma_twt',
        linkedinLink: 'https://www.linkedin.com/in/verma-kunal/',
        githubLink: 'https://github.com/verma-kunal'
    },
    {
        name: 'Dipankar Das',
        coverPhoto: 'https://media.discordapp.net/attachments/1016265994278289429/1016309636040773652/20210515_120358.png?width=464&height=598',
        twitterLink: 'https://twitter.com/DipankarDas011',
        linkedinLink: 'https://www.linkedin.com/in/dipankar-das-1324b6206/',
        githubLink: 'https://github.com/dipankardas011'
    },
    {
        name: 'Bhavya Sachdeva',
        coverPhoto: 'https://avatars.githubusercontent.com/u/84725791?v=4',
        twitterLink: 'https://twitter.com/bhavya_58',
        linkedinLink: 'https://www.linkedin.com/in/bhavya-sachdeva9/',
        githubLink: 'https://github.com/bhavyastar'
    },
    {
        name: 'Anurag Kumar',
        coverPhoto: 'https://media.discordapp.net/attachments/1016265994278289429/1016343269413748828/Screenshot_from_2022-06-27_06-37-52.png',
        twitterLink: 'https://twitter.com/kranurag7',
        linkedinLink: 'https://linkedin.com/in/kranurag7',
        githubLink: ''
    },
    {
        name: 'Barkatul Mujauddin',
        coverPhoto: 'https://media.discordapp.net/attachments/1016265994278289429/1016368483610669076/IMG_20220621_035446_659.jpg?width=597&height=597',
        twitterLink: 'https://twitter.com/barkatul_20',
        linkedinLink: 'https://www.linkedin.com/in/barkatul-mujauddin-3a67771b8',
        githubLink: 'https://github.com/barkatul'
    },
    {
        name: 'Rishit Dagli',
        coverPhoto: 'https://media.discordapp.net/attachments/1016265994278289429/1016401948901134469/rishit.png',
        twitterLink: 'https://twitter.com/rishit_dagli',
        linkedinLink: 'https://www.linkedin.com/in/rishit-dagli/',
        githubLink: 'https://github.com/Rishit-dagli'
    },
    {
        name: 'Mayank Gupta',
        coverPhoto: 'https://media.discordapp.net/attachments/1016265994278289429/1016457079373975562/image0.png',
        twitterLink: 'https://twitter.com/imayankgupta001',
        linkedinLink: 'https://www.linkedin.com/in/mkgupta001/',
        githubLink: 'https://github.com/mayankkuamr001'
    },
    {
        name: 'Arnav Barman',
        coverPhoto: 'https://media.discordapp.net/attachments/1016265994278289429/1016772748623761478/1662487879507.jpg?width=398&height=597',
        twitterLink: 'https://twitter.com/barman_arnav',
        linkedinLink: 'https://www.linkedin.com/in/arnavbarman/',
        githubLink: 'https://github.com/Arnav-Barman'
    },
]

