<?php

namespace UserBundle\Controller;

use FOS\UserBundle\FOSUserEvents;
use FOS\UserBundle\Event\FormEvent;
use FOS\UserBundle\Event\GetResponseUserEvent;
use FOS\UserBundle\Event\FilterUserResponseEvent;
use FOS\UserBundle\Controller\RegistrationController as FosRegistration;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use UserBundle\Entity\User;
use UserBundle\Form\Type\UserRegistrationType;

/**
 * Class RegistrationController
 */
class RegistrationController extends FosRegistration
{
    /**
     * @param Request $request
     *
     * @return Response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
     *
     * @Route("/register/", name="user_registration")
     */
    public function registerAction(Request $request)
    {
        if ($this->isGranted('ROLE_USER')) {
            return $this->redirect($this->generateUrl('homepage'));
        }

        /** @var $userManager \FOS\UserBundle\Model\UserManagerInterface */
        $userManager = $this->container->get('fos_user.user_manager');
        /** @var $dispatcher \Symfony\Component\EventDispatcher\EventDispatcherInterface */
        $dispatcher = $this->container->get('event_dispatcher');

        /** @var User $user */
        $user = $userManager->createUser();
        $user->setEnabled(true);

        $form          = $this->createForm(UserRegistrationType::class, $user);
        $userPhotoForm = $this->createForm(UserPho);

        $event = new GetResponseUserEvent($user, $request);
        $dispatcher->dispatch(FOSUserEvents::REGISTRATION_INITIALIZE, $event);

        if (null !== $event->getResponse()) {
            return $event->getResponse();
        }

        if ('POST' === $request->getMethod()) {
            $form->submit($request);

            if ($form->isValid()) {
                $event = new FormEvent($form, $request);
                $dispatcher->dispatch(FOSUserEvents::REGISTRATION_SUCCESS, $event);

                $em = $this->getDoctrine()->getManager();

                $em->flush();

                $userManager->updateUser($user);

                if (null === $response = $event->getResponse()) {
                    $response = new RedirectResponse($this->generateUrl('homepage'));
                }

                $dispatcher->dispatch(FOSUserEvents::REGISTRATION_COMPLETED, new FilterUserResponseEvent($user, $request, $response));

                return $response;
            }
        }

        return $this->render('AppBundle:User/Registration:register.html.twig', [
            'form'      => $form->createView(),
            'photoForm' => $userPhotoForm->createView(),
        ]);
    }
}